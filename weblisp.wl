;; Add tests for name mangling, epecially in static compiler
;; Add tests for toplevel expressions in static compiler, especially string 
;; Figure out tests for string

;; *************
;; * Tokenizer *
;; *************

(def token-proto (object))

(defmethod init token-proto (self src type start len)
  (doto self
    (seti! 'src src)
    (seti! 'type type)
    (seti! 'start start)
    (seti! 'len len)))

(defmethod text token-proto (self)
  (. self src (substr (. self start) (. self len))))

(defun lit(s)
  (regex (str "^" (. s (replace (regex "[.*+?^${}()|[\\]\\\\]" "g") "\\$&")))))

(def space-patt (regex "^\\s+"))
(def number-patt (regex "^[+\\-]?\\d+(\\.\\d*)?|^[+\\-]?\\.\\d+"))
(def sym-patt (regex "^[_.<>?+\\-=!@#$%\\^&*/a-zA-Z][_.<>?+\\-=!@#$%\\^&*/a-zA-Z0-9]*"))
(def str-patt (regex "^\"(?:(?:\\\\.)|[^\"])*\""))

(def token-table (list (list space-patt           -1)
		       (list (regex "^;[^\\n]*")  -1)
		       (list number-patt          'num-tok)
		       (list str-patt             'str-tok)
		       (list (lit "(")            'list-open-tok)
		       (list (lit ")")            'list-close-tok)
		       (list (lit "'")            'quote-tok)
		       (list (lit "`")            'backquote-tok)
		       (list (lit "~@")           'splice-tok)
		       (list (lit "~")            'unquote-tok)
		       (list sym-patt             'sym-tok)))

(def keywords (hashmap))
(set! (. keywords "true") 'true-tok)
(set! (. keywords "false") 'false-tok)
(set! (. keywords "undefined") 'undef-tok)
(set! (. keywords "null") 'null-tok)

(defun tokenize (src)
  (let (toks '()
	pos 0
	s src)
    (while (> (. s length) 0)
      (iterate
       (let (res false))
       (for i (index-in token-table))
       (for entry (in-list token-table))
       (while (not res))
       (do (set! res (. s (match (first entry)))))
       (finally _
	 (if res
	     (progn
	       (set! s (. s (substring (. res 0 length))))
	       (when (not= (second entry) -1)
		 (set! toks
		       (cons (make-instance token-proto src 
					    (or (geti keywords (. res 0)) (second entry))
					    pos (. res 0 length))
			     toks)))
	       (inc! pos (. res 0 length)))
	     (error (str "Unrecognized token: " s))))))
    (reverse (cons (make-instance token-proto src 'end-tok 0 0) toks))))

;; **********
;; * Parser *
;; **********

(def parser-proto (object))

(defmethod init parser-proto (self toks)
  (seti! self 'pos toks))

(defmethod peek-tok parser-proto (self)
  (car (. self pos)))

(defmethod consume-tok parser-proto (self)
  (let (curr (car (. self pos)))
    (set! (. self pos) (cdr (. self pos)))
    curr))

(defun escape-str (s)
  (. JSON (stringify s)))

(defun unescape-str (s)
  (. JSON (parse s)))

(defmethod parse-expr parser-proto (self)
  (let (tok (. self (consume-tok)))
    (case (. tok type)
      list-open-tok   (. self (parse-list))
      true-tok        true
      false-tok       false
      null-tok        null
      undef-tok       undefined
      num-tok         (parseFloat (. tok (text)))
      str-tok         (unescape-str (. tok (text)))
      quote-tok       `(quote ~(. self (parse-expr)))
      backquote-tok   (. self (parse-backquoted-expr))
      sym-tok         (symbol (. tok (text)))
      default         (error (str "Unexpected token: " (. tok type))))))

(defun set-source-pos! (o start end)
  (let (s (assoc! (hashmap)
	    'start start
	    'end end))
    (add-meta! o 'source-pos s)))

(defmethod parse-list parser-proto (self)
  (let (start-pos (. self (peek-tok) start))
    (iterate
     (while (and (not (equal? (set! t (. self (peek-tok) type)) 'list-close-tok))
		 (not (equal? (set! t (. self (peek-tok) type)) 'end-tok))))
     (collecting (. self (parse-expr)))
     (finally lst
       (if (equal? (. self (peek-tok) type) 'list-close-tok)
	   (set-source-pos! lst start-pos (. self (consume-tok) start))
	   (error "Unmatched paren!"))))))

(defmethod parse-backquoted-list parser-proto (self)
  (iterate
   (while (and (not (equal? (. self (peek-tok) type) 'list-close-tok))
	       (not (equal? (. self (peek-tok) type) 'end-tok))))
   (collecting (case (. self (peek-tok) type)
		 unquote-tok (progn (. self (consume-tok))
				    `(list ~(. self (parse-expr))))
		 splice-tok  (progn (. self (consume-tok))
				    (. self (parse-expr)))
		 default     `(list ~(. self (parse-backquoted-expr)))))
   (finally lst
     (if (equal? (. self (consume-tok) type) 'list-close-tok)
	 (cons 'concat lst)
	 (error "Unmatched paren!")))))

(defmethod parse-backquoted-expr parser-proto (self)
  (if (equal? (. self (peek-tok) type) 'list-open-tok)
      (progn (. self (consume-tok))
	     (. self (parse-backquoted-list)))
      `(quote ~(. self (parse-expr)))))

(defun parse (toks)
  (let (p (make-instance parser-proto toks))
    (iterate 
     (while (not (equal? (. p (peek-tok) type) 'end-tok)))
     (collecting (. p (parse-expr))))))

;; ************
;; * Compiler *
;; ************

(def mangling-table (hashmap))

(doto mangling-table
  (seti! "." "__DOT")
  (seti! "<" "__LT") 
  (seti! ">" "__GT")
  (seti! "?" "__QM")
  (seti! "+" "__PLUS")
  (seti! "-" "__MINUS")
  (seti! "=" "__EQL")
  (seti! "!" "__BANG")
  (seti! "@" "__AT")
  (seti! "#" "__HASH")
  (seti! "$" "__USD")
  (seti! "%" "__PCNT")
  (seti! "^" "__CARET")
  (seti! "&" "__AMP")
  (seti! "*" "__STAR")
  (seti! "/" "__SLASH"))

(defun keys (obj)
  (. Object (keys obj)))

(def mangling-rx (regex (str "\\" (. (keys mangling-table) (join "|\\"))) "gi"))

(defun mangle (x)
  (geti mangling-table x))

(defun mangle-name (name)
  (. name (replace mangling-rx mangle)))

(defpod source-mapping source-start source-end target-start target-end)
(defpod tc-str data mappings)
(defpod tc-frag val init)

(defun offset-source-mapping (e n)
  (let (adder (lambda (x) (+ x n)))
    (update e 'target-start adder 'target-end adder)))

(defun concat-tc-str (a b)
  (if (string? b)
      (make-tc-str (str (. a data) b) (. a mappings))
      (make-tc-str
       (str (. a data) (. b data))
       (concat (. a mappings)
	       (map (lambda (e)
		      (offset-source-mapping e (. a data length)))
		    (. b mappings))))))

(defun join-tc-frags (sep frags)
  (let (vals (interpose sep (map (getter 'val) frags))
	inits (map (getter 'init) frags))
    (make-tc-frag
     (reduce concat-tc-str (cdr vals) (car vals))
     (reduce concat-tc-str (cdr inits) (car inits)))))

(defun concat-tc-frag (a b)
  (if (string? b)
      (make-tc-frag (concat-tc-str (. a val) b) (. a init))
      (make-tc-frag
       (concat-tc-str (. a val) (. b val))
       (concat-tc-str (. a init) (. b init)))))

(defun interpolate-tc-%c (accum fmt idx args)
  (concat-tc-frag
   accum
   (nth (if (empty? (subs fmt 2))
	    (idiv idx 2)
	    (parseInt (subs fmt 2))) args)))

(defun interpolate-tc-%e (accum fmt idx args)
  (let (frags (nth (if (empty? (subs fmt 2))
		       (idiv idx 2)
		       (parseInt (subs fmt 2))) args))
    (update accum
	    'val
	    (lambda (old-val)
	      (concat-tc-str
	       old-val
	       (reduce (lambda (accum v)
			 (->> accum
			      (concat-tc-str (. v init))
			      (concat-tc-str (. v val))
			      (concat-tc-str ";")))
		       frags
		       (make-tc-str "" '())))))))

(defun interpolate-tc-frags (fmt &args)
  (let (rx (regex "(%[ce](?:[0-9]+)?)" "gi"))
    (iterate
     (let (accum (make-tc-frag (make-tc-str "" '()) (make-tc-str "" '()))))
     (for x (in-list (.split fmt rx)))
     (for n (from 0))
     (do (if (even? n)
	     (set! accum (concat-tc-frag accum x))
	     (case (subs x 0 2)
	       "%c" (set! accum (interpolate-tc-%c accum x n args))
	       "%e" (set! accum (interpolate-tc-%e accum x n args))
	       default (error "Unrecognized formatter!")))))))

(def %inspect% (. (require "util") inspect))
(defun inspect (obj) (%inspect% obj true 10))


;; Each compile____ function must return a pair [v:String, s:String] such that:
;; - v is a javascript expression that yields the value of the source lisp expression
;; - v does not contain any statements (and mustn't end with a semicolon)
;; - s contains zero or more javascript statements to be executed before evaluating v
;; - Given a result [_, s2] of another compilation, s+s2 must be valid javascript
;;   i.e. do not rely on automatic semicolon insertion
;;        do not rely on consumers to insert necessary separators before concat.

(def compiler-proto (object))

(defmethod init compiler-proto (self root)
  (doto self
    (seti! "root" root)
    (seti! "next-var-suffix" 0)))

(defmethod gen-var-name compiler-proto (self)
  (let (out (str "$$TMP" (. self next-var-suffix)))
    (inc! (. self next-var-suffix))
    out))

(defun compile-time-resolve (lexenv sym)
  (if (in lexenv (. sym name))
      (mangle-name (. sym name))
      (str "$$root[\"" (. sym name) "\"]")))

(defmethod compile-atom compiler-proto (self lexenv x)
  (cond (= x true)            (list "true" "")
	(= x false)           (list "false" "")
	(null? x)             (list "[]" "")
	(= x undefined)       (list "undefined" "")
	(symbol? x)           (list (compile-time-resolve lexenv x) "")
	(string? x)           (list (escape-str x) "")
	true                  (list (str x) "")))

(defmethod compile-funcall compiler-proto (self lexenv lst)
  (destructuring-bind (fun &args) lst
    (let (compiled-args (map (partial-method self 'compile lexenv) args)
	  compiled-fun (. self (compile lexenv fun)))
      (list (format "%0(%1)" (first compiled-fun) (join "," (map first compiled-args)))
	    (str (second compiled-fun) (join "" (map second compiled-args)))))))

(defmethod compile-new compiler-proto (self lexenv lst)
  (destructuring-bind (_ fun &args) lst
    (let (compiled-args (map (partial-method self 'compile lexenv) args)
	  compiled-fun (. self (compile lexenv fun)))
      (list (format "(new (%0)(%1))" (first compiled-fun) (join "," (map first compiled-args)))
	    (str (second compiled-fun) (join "" (map second compiled-args)))))))

(defmethod compile-method-call compiler-proto (self lexenv lst)
  (destructuring-bind (method obj &args) lst
    (let (compiled-obj (. self (compile lexenv obj))
	  compiled-args (map (partial-method self 'compile lexenv) args))
      (list (format "(%0)%1(%2)" (first compiled-obj) method (join "," (map first compiled-args)))
	    (str (second compiled-obj) (join "" (map second compiled-args)))))))

(defmethod compile-body-helper compiler-proto (self lexenv lst target-var-name)
  (let (compiled-body (map (partial-method self 'compile lexenv) lst)
	reducer (lambda (accum v)
		  (str accum (second v) (first v) ";")))
    (str (reduce reducer (butlast 1 compiled-body) "")
	 (second (last compiled-body))
	 target-var-name "=" (first (last compiled-body)) ";")))

;(defun process-args (args)
;  (join ","
;	(reverse
;	 (reduce (lambda (accum v)
;		   (cons (if (= (. v name 0) "&")
;			     (str "..." (mangle-name (. v name (slice 1))))
;			     (mangle-name (. v name)))
;			 accum)) args null))))

(defun is-vararg? (sym)
  (= (. sym name 0) "&"))

(defun lexical-name (sym)
  (if (is-vararg? sym)
      (. sym name (slice 1))
      (. sym name)))

(defun process-args (args)
  (join ","
	(map (lambda (v) (mangle-name (. v name)))
	     (filter (complement is-vararg?) args))))

(defmethod vararg-helper compiler-proto (self args)
  (let (last-arg (when (not (null? args)) (last args)))
    (if (and last-arg (is-vararg? last-arg))
	(format (str "var %0=Array(arguments.length-%1);"
		     "for(var %2=%1;%2<arguments.length;++%2)"
		     "{%0[%2-%1]=arguments[%2];}")
		(mangle-name (. last-arg name (slice 1)))
		(dec (count args))
		(. self (gen-var-name)))
	"")))

(defmethod compile-lambda compiler-proto (self lexenv lst)
  (destructuring-bind (_ (&args) &body) lst
    (let* (lexenv2 (reduce (lambda (accum v)
			     (seti! accum (lexical-name v) true)
			     accum)
		           args
			   (object lexenv))
	   ret-var-name (. self (gen-var-name))
	   compiled-body (. self (compile-body-helper lexenv2 body ret-var-name)))
      (list (format (str "(function(%0)"
			 "{"
			      (. self (vararg-helper args))
			      "var %1;"
                              "%2"
                              "return %1;"
			 "})")
		    (process-args args)
		    ret-var-name
		    compiled-body)
	    ""))))

(defmethod compile-if compiler-proto (self lexenv lst)
  (destructuring-bind (_ c t f) lst
    (let (value-var-name (. self (gen-var-name))
	  compiled-c (. self (compile lexenv c))
	  compiled-t (. self (compile lexenv t))
	  compiled-f (. self (compile lexenv f)))
      (list value-var-name
	    (format (str "var %0;"
			 "%1"
			 "if(%2){"
			    "%3"
                            "%0=%4;"
			 "}else{"
			    "%5"
			    "%0=%6;"
			 "}")
		    value-var-name
		    (second compiled-c)
		    (first compiled-c)
		    (second compiled-t)
		    (first compiled-t)
		    (second compiled-f)
		    (first compiled-f))))))

(defmethod compile-quoted-atom compiler-proto (self lexenv x)
  (if (symbol? x) 
      (list (str "(new $$root.Symbol(\"" (. x name) "\"))") "")
      (. self (compile-atom lexenv x))))

(defmethod compile-quoted-list compiler-proto (self lexenv lst)
  (list (str "$$root.list("
	     (join "," (map (partial-method self 'compile-quoted lexenv) lst))
	     ")")
	""))

(defmethod compile-quoted compiler-proto (self lexenv x)
  (if (atom? x)
      (. self (compile-quoted-atom lexenv x))
      (. self (compile-quoted-list lexenv x))))

(defmethod compile-setv compiler-proto (self lexenv lst)
  (destructuring-bind (_ name value) lst
    (let (var-name (compile-time-resolve lexenv name)
	  compiled-val (. self (compile lexenv value)))
      (list var-name (str (second compiled-val) var-name "=" (first compiled-val) ";")))))

(defmethod macroexpand-unsafe compiler-proto (self lexenv expr)
  (destructuring-bind (name &args) expr
    (let (tmp (. self (compile-funcall lexenv (cons name (map (lambda (v) `(quote ~v)) args)))))
      (. self root (jeval (str (second tmp) (first tmp)))))))

(defmethod is-macro compiler-proto (self name)
  (and (in (. self root) name) (. (geti (. self root) name) isMacro)))

(defmethod compile compiler-proto (self lexenv expr)
  (if (and (list? expr) (not (null? expr)))
      (let (first (car expr))
        (if (symbol? first)
            (case first
		lambda    (. self (compile-lambda lexenv expr))
		new       (. self (compile-new lexenv expr))
                if        (. self (compile-if lexenv expr))
                quote     (. self (compile-quoted lexenv (second expr)))
                setv!     (. self (compile-setv lexenv expr))
                def       (. self (compile-setv lexenv expr))
                default   (cond (. self (is-macro (. first name)))
				(. self (compile lexenv (. self (macroexpand-unsafe lexenv expr))))

				(= (. first name 0) ".")
				(. self (compile-method-call lexenv expr))
				
				true
				(. self (compile-funcall lexenv expr))))
	    (. self (compile-funcall lexenv expr))))
      (. self (compile-atom lexenv expr))))
