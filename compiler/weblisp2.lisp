;; Add tests for name mangling, epecially in static compiler
;; Add tests for toplevel expressions in static compiler, especially string 
;; Figure out tests for string

(def VM (require "vm"))
(def Reflect (require "harmony-reflect"))

(def defmacro
    (lambda (name args &body)
      `((lambda ()
	  (def ~name (lambda ~args ~@body))
	  (setmac! ~name)))))

(setmac! defmacro)

(defmacro defun (name args &body)
  `(def ~name (lambda ~args ~@body)))

(defmacro progn (&body)
  (if (null? body)
      undefined
      `((lambda () ~@body))))
 
(defmacro when (c &body)
  `(if ~c (progn ~@body) undefined))

(defmacro cond (&pairs)
  (if (null? pairs)
      undefined
      `(if ~(car pairs)
	   ~(car (cdr pairs))
	   (cond ~@(cdr (cdr pairs))))))

(defmacro and (&args)
  (if (null? args)
      true
      `(if ~(car args) ~(cons 'and (cdr args)) false)))

(defmacro or (&args)
  (if (null? args)
      false
      (if (null? (cdr args))
	  (car args)
	  `((lambda (c)
	      (if c c ~(cons 'or (cdr args))))
	    ~(car args)))))

(defun macroexpand-1 (expr)
  (if (and (list? expr) (macro? (geti *ns* (car expr))))
      (apply (geti *ns* (car expr)) (cdr expr))
      expr))

(defun inc (x) (+ x 1))
(defun dec (x) (- x 1))

(defmacro incv! (name amt)
  (setv! amt (or amt 1))
  `(setv! ~name (+ ~name ~amt)))

(defmacro decv! (name amt)
  (setv! amt (or amt 1))
  `(setv! ~name (- ~name ~amt)))

(def first car)
(defun second (lst) (car (cdr lst)))
(defun third (lst) (car (cdr (cdr lst))))
(defun fourth (lst) (car (cdr (cdr (cdr lst)))))
(defun fifth (lst) (car (cdr (cdr (cdr (cdr lst))))))
(def rest cdr)

(defun getter (field)
  (lambda (obj) (geti obj field)))

(defun reduce (r lst accum)
  (if (null? lst)
      accum
      (reduce r (cdr lst) (r accum (car lst)))))

(defun reverse (lst) (reduce (lambda (accum v) (cons v accum)) lst '()))

(defun transform-list (r lst)
  (reverse (reduce r lst '())))

(defun map (f lst)
  (transform-list
   (lambda (accum v) (cons (f v) accum))
   lst))

(defun filter (p lst)
  (transform-list
   (lambda (accum v) (if (p v) (cons v accum) accum))
   lst))

(defun take (n lst)
  (transform-list
   (lambda (accum v)
     (decv! n)
     (if (>= n 0)
	 (cons v accum)
	 accum))
   lst))

(defun drop (n lst)
  (transform-list
   (lambda (accum v)
     (decv! n)
     (if (>= n 0)
	 accum
	 (cons v accum)))
   lst))

(defun every-nth (n lst)
  ((lambda (counter)
     (transform-list
      (lambda (accum v)
	(if (= (mod (incv! counter) n) 0) (cons v accum) accum))
      lst)) -1))

(defun nth (n lst)
  (if (= n 0) (car lst) (nth (dec n) (cdr lst))))
    
(defun butlast (n lst)
  (take (- (count lst) n) lst))

(defun last (lst)
  (reduce (lambda (accum v) v) lst undefined))

(defun count (lst)
  (reduce (lambda (accum v) (inc accum)) lst 0))
    
(defun zip (a &more)
   ((lambda (args)
        (if (reduce (lambda (accum v) (or accum (null? v))) args false)
            null
            (cons (map car args) (apply zip (map cdr args))))) (cons a more)))

(defmacro let (bindings &body)
  `((lambda ~(every-nth 2 bindings) ~@body)
    ~@(every-nth 2 (cdr bindings))))

(defun interpose(x lst)
  (let (fst true)
    (transform-list (lambda (accum v)
		      (if fst
			  (progn
			    (setv! fst false)
			    (cons v accum))
			  (cons v (cons x accum))))
		    lst)))

(defun join (sep lst)
  (reduce str (interpose sep lst) ""))

(defun find (f arg lst)
  (let (idx -1)
    (reduce (lambda (accum v)
	      (incv! idx)
	      (if (f arg v) idx accum))
	    lst -1)))

(defun flatten (x)
  (if (atom? x) (list x)
      (apply concat (map flatten x))))

(defun map-indexed (f lst)
  (let (idx -1)
    (transform-list
     (lambda (accum v) (cons (f v (incv! idx)) accum))
     lst)))

(defmacro loop (bindings &body)
  `(let (recur null)
     (setv! recur (lambda ~(every-nth 2 bindings) ~@body))
     (recur ~@(every-nth 2 (cdr bindings)))))

(defun partition (n lst)
  (if (null? lst)
      null
      (reverse
       (loop (accum '()
	      part (cons (car lst) null)
	      rem (cdr lst)
	      counter 1)
	  (if (null? rem)
	      (cons (reverse part) accum)
	      (if (= (mod counter n) 0)
		  (recur (cons (reverse part) accum) (cons (car rem) null) (cdr rem) (inc counter))
		  (recur accum (cons (car rem) part) (cdr rem) (inc counter))))))))

(defmacro method (args &body)
  `(lambda ~(cdr args)
      ((lambda (~(car args))
	 ~@body) this)))

(defmacro defmethod (name obj args &body)
  `(seti! ~obj (quote ~name)
     (lambda ~(cdr args)
	((lambda (~(car args))
	 ~@body) this))))

(defun make-instance (proto &args)
  (let (instance (object proto))
    (apply-method (geti proto 'init) instance args)
    instance))

(defun new (constructor &args)
  (let (instance (object (. prototype constructor)))
    (apply-method constructor instance args)))

(defun dot-helper (obj-name reversed-fields)
  (if (null? reversed-fields)
      obj-name
      `(geti ~(dot-helper obj-name (cdr reversed-fields)) (quote ~(car reversed-fields)))))

(defmacro . (obj-name &fields)
  (let (rev-fields (reverse fields))
    (if (list? (car rev-fields))
	`(let (target ~(dot-helper obj-name (cdr (cdr rev-fields))))
	   (call-method (geti target (quote ~(second rev-fields))) target ~@(first rev-fields)))
	(dot-helper obj-name rev-fields))))

(defun prototype? (p o)
  (. p isPrototypeOf (o)))

(defun equal? (a b)
  (cond
    (null? a)   (null? b)
    (symbol? a) (and (symbol? b) (= (. a name) (. b name)))
    (atom? a)   (= a b)
    (list? a)   (and (list? b) (equal? (car a) (car b)) (equal? (cdr a) (cdr b)))))

(defun split (p lst)
  (let (res (loop (l1 null
		   l2 lst)
	       (if (or (null? l2) (p (car l2)))
		   (list l1 l2)
		   (recur (cons (car l2) l1) (cdr l2)))))
    (list (reverse (first res)) (second res))))
 
(defun any? (lst)
  (if (reduce (lambda (accum v)
		(if accum accum v))
	      lst
	      false)
      true
      false))

(defun splitting-pair (binding-names outer pair)
  (any? (map (lambda (sym) (and (= (find equal? sym outer) -1)
				(not= (find equal? sym binding-names) -1)))
	     (filter symbol? (flatten (second pair))))))

(defun let-helper* (outer binding-pairs body)
  (let (binding-names (map first binding-pairs))
    (let (divs (split (lambda (pair) (splitting-pair binding-names outer pair))
		       binding-pairs))
      (if (null? (second divs))
	  `(let ~(apply concat (first divs)) ~@body)
	  `(let ~(apply concat (first divs))
		~(let-helper* (concat binding-pairs (map first (first divs))) (second divs) body))))))

(defmacro let* (bindings &body)
  (let-helper* '() (partition 2 bindings) body))

(defun complement (f) (lambda (x) (not (f x))))

(defun compose (f1 f2)
  (lambda (&args)
    (f1 (apply f2 args))))

(defun partial (f &args1)
  (lambda (&args2)
    (apply f (concat args1 args2))))

(defun partial-method (obj method-field &args1)
  (lambda (&args2)
    (apply-method (geti obj method-field) obj (concat args1 args2))))

(defun format (&args)
  (let (rx (regex "%[0-9]+" "gi"))
    (. (car args)
       replace
       (rx (lambda (match)
	     (nth (parseInt (. match substring (1))) (cdr args)))))))

(defmacro case (e &pairs)
    (let* (e-name (gensym)
           def-idx (find equal? 'default pairs)
           def-expr (if (= def-idx -1) '(error "Fell out of case!") (nth (inc def-idx) pairs))
           zipped-pairs (partition 2 pairs))
        `(let (~e-name ~e)
            (cond ~@(apply concat
                            (map (lambda (pair) (list `(equal? ~e-name (quote ~(first pair))) (second pair)))
                                 (filter (lambda (pair) (not (equal? (car pair) 'default))) zipped-pairs)))
                    true ~def-expr))))

(defun destruct-helper (structure expr)
  (let (expr-name (gensym))
    `(~expr-name ~expr
      ~@(apply concat
	       (map-indexed (lambda (v idx)
			      (if (symbol? v)
				  (if (= (. v name 0) "&")
				      `(~(symbol (. v name slice (1))) (drop ~idx ~expr-name))
				      (if (= (. v name) "_") '() `(~v (nth ~idx ~expr-name))))
				  (destruct-helper v `(nth ~idx ~expr-name))))
			    structure)))))

(defmacro destructuring-bind (structure expr &body)
  `(let* ~(if (symbol? structure)
	      (list structure expr)
	      (destruct-helper structure expr))
	 ~@body))

(defun macroexpand (expr)
  (if (list? expr)
      (if (macro? (geti *ns* (car expr)))
	  (macroexpand (apply (geti *ns* (car expr)) (cdr expr)))
	  (map macroexpand expr))
      expr))

(defun list-matches? (expr patt)
    (cond
        (equal? (first patt) 'quote)
        (equal? (second patt) expr)
        
        (and (symbol? (first patt)) (= (. (first patt) name 0) "&"))
        (list? expr)
        
        true
        (if (and (list? expr) (not (null? expr)))
            (and (matches? (car expr) (car patt)) (matches? (cdr expr) (cdr patt)))
            false)))

(defun matches? (expr patt)
    (cond
        (null? patt) (null? expr)
        (list? patt) (list-matches? expr patt)
        (symbol? patt) true
        true         (error "Invalid pattern!")))

(defun pattern->structure (patt)
  (if (and (list? patt) (not (null? patt)))
      (if (equal? (car patt) 'quote)
	  '_
	  (map pattern->structure patt))
      patt))

(defmacro pattern-case (e &pairs)
  (let* (e-name (gensym)
         zipped-pairs (partition 2 pairs))
    `(let (~e-name ~e)
       (cond ~@(apply concat
		      (map (lambda (pair)
			     (list `(matches? ~e-name (quote ~(first pair)))
				   `(destructuring-bind ~(pattern->structure (first pair)) ~e-name ~(second pair))))
			   zipped-pairs))
	     true (error "Fell out of case!")))))

(defmacro set! (place v)
  (pattern-case (macroexpand place)
     ('geti obj field) `(seti! ~obj ~field ~v)
     any (if (symbol? any)
	     `(setv! ~any ~v)
	     `(error "Not a settable place!"))))

(defmacro inc! (name amt)
  (set! amt (or amt 1))
  `(set! ~name (+ ~name ~amt)))

(defmacro dec! (name amt)
  (set! amt (or amt 1))
  `(set! ~name (- ~name ~amt)))

(defun push (x lst) (reverse (cons x (reverse lst))))

(defmacro -> (x &forms)
  (if (null? forms)
      x
      `(-> ~(push x (car forms)) ~@(cdr forms))))

(defmacro doto (obj-expr &body)
  (let (binding-name (gensym))
    `(let (~binding-name ~obj-expr)
       ~@(map (lambda (v)
		(destructuring-bind (f &args) v
		  (cons f (cons binding-name args))))
	      body)
       ~binding-name)))

(defmacro while (c &body)
  `(loop ()
      (when ~c
	~@body
	(recur))))

(defun sort (cmp lst)
  (. lst sort (cmp)))

(defun in-range (binding-name start end step)
  (set! step (or step 1))
  (let (data (object null))
    (set! (. data bind) (list binding-name start))
    (set! (. data post) `((inc! ~binding-name ~step)))
    (set! (. data cond) `(< ~binding-name ~end))
    data))

(defun index-in (binding-name expr)
  (let (len-name (gensym)
	data (object null))
    (set! (. data bind) `(~binding-name 0
			  ~len-name (count ~expr)))
    (set! (. data post) `((inc! ~binding-name 1)))
    (set! (. data cond) `(< ~binding-name ~len-name))
    data))

(defun in-list (binding-name expr)
  (let (lst-name (gensym)
	data (object null))
    (set! (. data bind) (list lst-name expr
			      binding-name null))
    (set! (. data pre) `((set! ~binding-name (car ~lst-name))))
    (set! (. data post) `((set! ~lst-name (cdr ~lst-name))))
    (set! (. data cond) `(not (null? ~lst-name)))
    data))

(defun iterate-compile-for (form)
  (destructuring-bind (_ binding-name (func-name &args)) form
    (apply (geti *ns* func-name) (cons binding-name args))))

(defun iterate-compile-while (form)
  (let (data (object null))
    (set! (. data cond) (second form))
    data))

(defun iterate-compile-do (form)
  (let (data (object null))
    (set! (. data body) (cdr form))
    data))

(defun iterate-compile-finally (res-name form)
  (let (data (object null))
    (destructuring-bind (_ binding-name &body) form
      (set! (. data bind) (list binding-name undefined))
      (set! (. data finally) (cons `(set! ~binding-name ~res-name) (cdr (cdr form)))))
    data))

(defun iterate-compile-let (form)
  (let (data (object null))
    (set! (. data bind) (second form))
    data))

(defun iterate-compile-collecting (form)
  (let (data (object null)
	accum-name (gensym))
    (set! (. data bind) (list accum-name '()))
    (set! (. data body) `((set! ~accum-name (cons ~(second form) ~accum-name))))
    (set! (. data finally) `((reverse ~accum-name)))
    data))



(defun collect-field (field objs)
  (filter (lambda (x) (not= x undefined))
	  (map (getter field) objs)))



(defmacro iterate (&forms)
  (let* (res-name (gensym)
	 all (map (lambda (form)
		    (case (car form)
		      let         (iterate-compile-let form)
		      for         (iterate-compile-for form)
		      while       (iterate-compile-while form)
		      do          (iterate-compile-do form)
		      collecting  (iterate-compile-collecting form)
		      finally     (iterate-compile-finally res-name form)
		      default     (error "Unknown iterate form")))
	       forms)
	 body-actions (apply concat (collect-field 'body all))
	 final-actions (apply concat (map (lambda (v)
					    (push `(set! ~res-name ~(last v)) (butlast 1 v)))
					  (collect-field 'finally all))))
    `(let* ~(concat (list res-name undefined)
		    (apply concat (collect-field 'bind all)))
	   (loop ()
	      (if ~(cons 'and (collect-field 'cond all))
		  (progn
		    ~@(apply concat (collect-field 'pre all))
		    ~@(butlast 1 body-actions)
		    (set! ~res-name ~(last body-actions))
		    ~@(apply concat (collect-field 'post all))
		    (recur))
		  (progn
		    ~@(if (null? final-actions) (list res-name) final-actions)))))))

(def token-proto (object))

(defmethod init token-proto (self src type start len)
  (doto self
    (seti! 'src src)
    (seti! 'type type)
    (seti! 'start start)
    (seti! 'len len)))

(defmethod text token-proto (self)
  (. self src substr ((. self start) (. self len))))

(defun lit(s)
  (regex (str "^" (. s replace ((regex "[.*+?^${}()|[\\]\\\\]" "g") "\\$&")))))

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
      (iterate (let (res false))
	       (for i (index-in token-table))
	       (for entry (in-list token-table))
	       (while (not res))
	       (do (set! res (. s match ((first entry)))))
	       (finally _ (if res
			      (progn
				(set! s (. s substring ((. res 0 length))))
				(when (not= (second entry) -1)
				  (set! toks
					(cons (make-instance token-proto
							     src
							     (or (geti keywords (. res 0)) (second entry))
							     pos
							     (. res 0 length))
					      toks)))
				(inc! pos (. res 0 length)))
			      (error (str "Unrecognized token: " s))))))
    (reverse (cons (make-instance token-proto src 'end-tok 0 0) toks))))

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
  (. JSON stringify (s)))

(defun unescape-str (s)
  (. JSON parse (s)))

(defmethod parse-expr parser-proto (self)
  (let (tok (. self consume-tok ()))
    (case (. tok type)
      list-open-tok   (. self parse-list ())
      true-tok        true
      false-tok       false
      null-tok        null
      undef-tok       undefined
      num-tok         (parseFloat (. tok text ()))
      str-tok         (unescape-str (. tok text ()))
      quote-tok       `(quote ~(. self parse-expr ()))
      backquote-tok   (. self parse-backquoted-expr ())
      sym-tok         (symbol (. tok text ()))
      default         (error (str "Unexpected token: " (. tok type))))))

(defmethod parse-list parser-proto (self)
  (iterate (while (and (not (equal? (set! t (. (. self peek-tok ()) type)) 'list-close-tok))
		       (not (equal? (set! t (. (. self peek-tok ()) type)) 'end-tok))))
	   (collecting (. self parse-expr ()))
	   (finally lst
	      (if (equal? (. (. self consume-tok ()) type) 'list-close-tok)
		  lst
		  (error "Unmatched paren!")))))

(defmethod parse-backquoted-list parser-proto (self)
  (iterate (while (and (not (equal? (. (. self peek-tok ()) type) 'list-close-tok))
		       (not (equal? (. (. self peek-tok ()) type) 'end-tok))))
	   (collecting (case (. (. self peek-tok ()) type)
			 unquote-tok (progn (. self consume-tok ())
					    `(list ~(. self parse-expr ())))
			 splice-tok  (progn (. self consume-tok ())
					    (. self parse-expr ()))
			 default     `(list ~(. self parse-backquoted-expr ()))))
	   (finally lst 
	      (if (equal? (. (. self consume-tok ()) type) 'list-close-tok)
		  (cons 'concat lst)
		  (error "Unmatched paren!")))))

(defmethod parse-backquoted-expr parser-proto (self)
  (if (equal? (. (. self peek-tok ()) type) 'list-open-tok)
      (progn (. self consume-tok ())
	     (. self parse-backquoted-list ()))
      `(quote ~(. self parse-expr ()))))

(defun parse (toks)
  (let (p (make-instance parser-proto toks))
    (iterate 
     (while (not (equal? (. (. p peek-tok ()) type) 'end-tok)))
     (collecting (. p parse-expr ())))))

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
  (. Object keys (obj)))

(def mangling-rx (regex (str "\\" (. (keys mangling-table) join ("|\\"))) "gi"))

(defun mangle (x)
  (geti mangling-table x))

(defun mangle-name (name)
  (. name replace (mangling-rx mangle)))

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
	  compiled-fun (. self compile (lexenv fun)))
      (list (format "%0(%1)" (first compiled-fun) (join "," (map first compiled-args)))
	    (str (second compiled-fun) (join "" (map second compiled-args)))))))

(defmethod compile-body-helper compiler-proto (self lexenv lst target-var-name)
  (let (compiled-body (map (partial-method self 'compile lexenv) lst)
	reducer (lambda (accum v)
		  (str accum (second v) (first v) ";")))
    (str (reduce reducer (butlast 1 compiled-body) "")
	 (second (last compiled-body))
	 target-var-name "=" (first (last compiled-body)) ";")))

(defun process-args (args)
  (join ","
	(reverse
	 (reduce (lambda (accum v)
		   (cons (if (= (. v name 0) "&")
			     (str "..." (mangle-name (. v name slice (1))))
			     (mangle-name (. v name)))
			 accum)) args null))))

(defun lexical-name (sym)
  (if (= (. sym name 0) "&")
      (mangle-name (. sym name slice (1)))
      (mangle-name (. sym name))))

(defmethod compile-lambda compiler-proto (self lexenv lst)
  (destructuring-bind (_ (&args) &body) lst
    (let* (lexenv2 (reduce (lambda (accum v)
			     (seti! accum (lexical-name v) true)
			     accum)
		           args (object lexenv))
	   ret-var-name (. self gen-var-name ())
	   compiled-body (. self compile-body-helper (lexenv2 body ret-var-name)))
      (list (format (str "(function(%0)"
			 "{"
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
    (let (value-var-name (. self gen-var-name ())
	  compiled-c (. self compile (lexenv c))
	  compiled-t (. self compile (lexenv t))
	  compiled-f (. self compile (lexenv f)))
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
      (. self compile-atom (lexenv x))))

(defmethod compile-quoted-list compiler-proto (self lexenv lst)
  (list (str "$$root.list("
	     (join "," (map (partial-method self 'compile-quoted lexenv) lst))
	     ")")
	""))

(defmethod compile-quoted compiler-proto (self lexenv x)
  (if (atom? x)
      (. self compile-quoted-atom (lexenv x))
      (. self compile-quoted-list (lexenv x))))

(defmethod compile-setv compiler-proto (self lexenv lst)
  (destructuring-bind (_ name value) lst
    (let (var-name (compile-time-resolve lexenv name)
	  compiled-val (. self compile (lexenv value)))
      (list var-name (str (second compiled-val) var-name "=" (first compiled-val) ";")))))

(defmethod macroexpand-unsafe compiler-proto (self lexenv expr)
  (destructuring-bind (name &args) expr
    (let (tmp (. self compile-funcall (lexenv (cons name (map (lambda (v) `(quote ~v)) args)))))
      (. self root jeval ((str (second tmp) (first tmp)))))))

(defmethod is-macro compiler-proto (self name)
  (and (in (. self root) name) (. (geti (. self root) name) isMacro)))

(defmethod compile compiler-proto (self lexenv expr)
  (if (and (list? expr) (not (null? expr)))
      (let (first (car expr))
        (if (symbol? first)
            (case first
		lambda    (. self compile-lambda (lexenv expr))
                if        (. self compile-if (lexenv expr))
                quote     (. self compile-quoted (lexenv (second expr)))
                setv!     (. self compile-setv (lexenv expr))
                def       (. self compile-setv (lexenv expr))
                default   (if (. self is-macro ((. first name)))
			      (. self compile (lexenv (. self macroexpand-unsafe (lexenv expr))))
			      (. self compile-funcall (lexenv expr))))
	    (. self compile-funcall (lexenv expr))))
      (. self compile-atom (lexenv expr))))


(def node-evaluator-proto (object))

(defmethod init node-evaluator-proto (self)
  (let (root (object *ns*)
	sandbox (object))
    (seti! sandbox "$$root" root)
    (. VM createContext (sandbox))
    (seti! root "jeval" (lambda (str) (. VM runInContext (str sandbox))))
    (doto self
       (seti! "root" root)
       (seti! "compiler" (make-instance compiler-proto root)))))

(defmethod eval node-evaluator-proto (self expr)
  (let (tmp (. self compiler compile ((object) expr)))
    (. self root jeval ((str (second tmp) (first tmp))))))

(defmethod eval-str node-evaluator-proto (self s)
  (let (forms (parse (tokenize s)))
    (iterate (for form (in-list forms))
	     (do (. self eval (form))))))


(def lazy-def-proto (object))

(defmethod init lazy-def-proto (self compilation-result)
  (seti! self 'code (str (second compilation-result) (first compilation-result))))

(def static-compiler-proto (object compiler-proto))

(defmethod init static-compiler-proto (self)
  (let* (root (object *ns*)
	 sandbox (object)
	 handler (object)
	 next-gensym-suffix 0)
    (seti! handler 'get (lambda (target name)
			  (let (r (geti target name))
			    (when (prototype? lazy-def-proto r)
			      (set! r (. root jeval ((. r code))))
			      (seti! target name r))
			    r)))
    (seti! sandbox "$$root" (new Proxy root handler))
    (. VM createContext (sandbox))
    (seti! root "jeval" (lambda (str) (. VM runInContext (str sandbox))))
    (seti! root "*ns*" (. sandbox "$$root"))
    (seti! root "gensym" (lambda () (symbol (str "__GS" (inc! next-gensym-suffix)))))
    (call-method (. compiler-proto init) self root)))

(defmethod compile-toplevel static-compiler-proto (self e)
  (let (lexenv (object))
    (pattern-case e
      ('def name val) (let (tmp (. self compile (lexenv e)))
			(seti! (. self root) name (make-instance lazy-def-proto tmp))
			(str (second tmp) (first tmp) ";"))

      ('setmac! name) (let (tmp (. self compile (lexenv e)))
			(. self root jeval ((str (second tmp) (first tmp))))
			(str (second tmp) (first tmp) ";"))

      (('lambda (&args) &body)) (join "" (map (partial-method self 'compile-toplevel) body))
      
      (name &args) (if (. self is-macro (name))
		       (. self compile-toplevel ((. self macroexpand-unsafe (lexenv e))))
		       (let (tmp (. self compile (lexenv e)))
			 (str (second tmp) (first tmp) ";")))

      any (let (tmp (. self compile (lexenv e)))
	    (str (second tmp) (first tmp) ";")))))

(defmethod compile-unit static-compiler-proto (self s)
  (join "" (map (partial-method self 'compile-toplevel) (parse (tokenize s)))))

;(let* (e (make-node-evaluator)
;       ev (lambda (s) (. e eval-str (s))))
;  (print (ev (str "(setv! testmac2 (lambda () 'baz))"
;		  "(setmac! testmac2)"
;		  "((lambda (baz) (+ (testmac2) 5)) 5)"))))

(export 'root *ns*)
