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
  (let (instance (object (geti constructor 'prototype)))
    (apply-method constructor instance args)))

(defun call-method-by-name (obj name &args)
  (apply-method (geti obj name) obj args))

(defun dot-helper (obj-name reversed-fields)
  (if (null? reversed-fields)
      obj-name
      (if (list? (car reversed-fields))
	  `(call-method-by-name
	    ~(dot-helper obj-name (cdr reversed-fields))
	    (quote ~(car (car reversed-fields)))
	    ~@(cdr (car reversed-fields)))
	  `(geti ~(dot-helper obj-name (cdr reversed-fields)) (quote ~(car reversed-fields))))))

(defun crap (obj-name &more)
	obj-name)
	  
;(defmacro . (o? q &fields)
;   (print "WTF IS GOING ON???" o? q fields)
;  (dot-helper o (reverse fields)))

;(. obj baz bar foo)