;; Add tests for name mangling, epecially in static compiler
;; Add tests for toplevel expressions in static compiler, especially string 
;; Figure out tests for string

(def defmacro
     (lambda (name args &body)
        `((lambda ()
            (def ~name (lambda ~args ~@body))
            (setmac! ~name)))))

(setmac! defmacro)

(defmacro method (args &body)
  `(lambda ~(cdr args)
      ((lambda (~(car args))
	 ~@body) this)))

(defmacro defmethod (name obj args &body)
  `(seti! ~obj (quote ~name)
     (lambda ~(cdr args)
	((lambda (~(car args))
	 ~@body) this))))

(defmacro defun (name args &body)
    `(def ~name (lambda ~args ~@body)))

(defmacro progn (&body)
    `((lambda () ~@body)))
    
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
	`((lambda (c)
	   (if c c ~(cons 'or (cdr args))))
	  ~(car args))))

(defun macroexpand-1 (expr)
    (if (and (list? expr) (macro? (geti *ns* (car expr))))
        (apply (geti *ns* (car expr)) (cdr expr))
        expr))

(defun inc (x) (+ x 1))
(defun dec (x) (- x 1))

(defmacro inc! (name amt)
  (setv! amt (or amt 1))
  `(setv! ~name (+ ~name ~amt)))

(defmacro dec! (name amt)
  (setv! amt (or amt 1))
  `(setv! ~name (- ~name ~amt)))

(def first car)
(defun second (lst) (car (cdr lst)))
(defun third (lst) (car (cdr (cdr lst))))
(defun fourth (lst) (car (cdr (cdr (cdr lst)))))
(defun fifth (lst) (car (cdr (cdr (cdr (cdr lst))))))

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
            (dec! n)
            (if (>= n 0)
                (cons v accum)
                accum))
        lst))

(defun drop (n lst)
    (transform-list
        (lambda (accum v)
            (dec! n)
            (if (>= n 0)
                accum
                (cons v accum)))
        lst))

(defun every-nth (n lst)
    ((lambda (counter)
        (transform-list
            (lambda (accum v)
                (if (= (mod (inc! counter) n) 0) (cons v accum) accum))
            lst)) -1))

(defun nth (n lst)
    (if (= n 0) (car lst) (nth (dec n) (cdr lst))))
    
(defun count (lst)
    (reduce (lambda (accum v) (inc accum)) lst 0))
    
(defun zip (a &more)
   ((lambda (args)
        (if (reduce (lambda (accum v) (or accum (null? v))) args false)
            null
            (cons (map car args) (apply zip (map cdr args))))) (cons a more)))

(defmacro let (bindings &body)
    `((lambda ~(every-nth 2 bindings)
        ~@body) ~@(every-nth 2 (cdr bindings))))

(defun find (f arg lst)
    (let (idx -1)
        (reduce (lambda (accum v)
                    (inc! idx)
                    (if (f arg v) idx accum))
                lst -1)))

(defun flatten (x)
    (if (atom? x) (list x)
        (apply concat (map flatten x))))

(defun map-indexed (f lst)
    (let (idx -1)
        (transform-list
            (lambda (accum v) (cons (f v (inc! idx)) accum))
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

(defun push (x lst) (reverse (cons x (reverse lst))))

(defmacro -> (x &forms)
  (if (null? forms)
      x
      `(-> ~(push x (car forms)) ~@(cdr forms))))

(defmacro while (c &body)
  `(loop ()
      (when ~c
	~@body
	(recur))))

(defun sort (cmp lst)
  (. lst sort (cmp)))

(defun in-range (binding-name start end step)
  (set! step (or step 1))
  (list (list binding-name start)
	`((inc! ~binding-name ~step))
	`(< ~binding-name ~end)))

(defun iterate-compile-for (form)
  (destructuring-bind (_ binding-name (func-name &args)) form
    (apply (geti *ns* func-name) (cons binding-name args))))

(defun iterate-compile-while (form)
  (list '() '() (second form)))

(defun iterate-compile-do (form)
  (list '() (cdr form) '()))

(def iterate-form-order '(do while for))

(defmacro iterate (&forms)
  (let* (trips (map (lambda (form)
		      (case (car form)
			for     (iterate-compile-for form)
			while   (iterate-compile-while form)
			do      (iterate-compile-do form)
			default (error "Unknown iterate form")))
		 (sort (lambda (a b) (- (find equal? (car a) iterate-form-order)
					(find equal? (car b) iterate-form-order)))
		       forms))
	 bindings (map first trips)
	 actions (map second trips)
	 conds (filter (complement null?) (map third trips)))
    `(let* ~(apply concat bindings)
	   (loop ()
	      (when ~(cons 'and conds)
		    ~@(apply concat actions)
		    (recur))))))

(defun make-enum (&args)
    (let (e (object)
          len (count args))
        (loop (i 0)
            (when (< i len)
                (seti! e (geti args i) i)
                (recur (inc i))))
        e))

(defmacro gen-consts (names suffix)
  `(progn
     ~@(map-indexed
	(lambda (name idx)
	  `(def ~(symbol (str name "-" suffix)) ~idx))
	names)))

(gen-consts ("list-open" "list-close" "true" "false" "null" "undef" "num" "sym" "str"
			 "quote" "backquote" "unquote" "splice" "end") "tok")

(def token-proto (object))

(defun make-token (src type start len)
  (let (o (object token-proto))
    (set! (. o src) src)
    (set! (. o type) type)
    (set! (. o start) start)
    (set! (. o len) len)
    o))

(defmethod text token-proto (self)
  (. self src substr ((. self start) (. self len))))

(defun lit(s)
  (regex (str "^" (. s replace ((regex "[.*+?^${}()|[\\]\\\\]" "g") "\\$&")))))

(def space-patt (regex "^\\s+"))
(def number-patt (regex "^[+\\-]?\\d+(\\.\\d*)?|^[+\\-]?\\.\\d+"))
(def sym-patt (regex "^[_.<>?+\\-=!@#$%\\^&*/a-zA-Z][_.<>?+\\-=!@#$%\\^&*/a-zA-Z0-9]*"))
(def str-patt (regex "^\"(?:(?:\\\\\")|[^\"])*\""))

(def token-table (list (list space-patt           -1)
		       (list (regex "^;[^\\n]*")  -1)
		       (list number-patt          num-tok)
		       (list str-patt             str-tok)
		       (list (lit "(")            list-open-tok)
		       (list (lit ")")            list-close-tok)
		       (list (lit "'")            quote-tok)
		       (list (lit "`")            backquote-tok)
		       (list (lit "~@")           splice-tok)
		       (list (lit "~")            unquote-tok)
		       (list sym-patt             sym-tok)))

(def keywords (object null))
(set! (. keywords "true") true-tok)
(set! (. keywords "false") false-tok)
(set! (. keywords "undefined") undefined-tok)
(set! (. keywords "null") null-tok)


