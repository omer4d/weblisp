;; Add tests for name mangling, epecially in static compiler
;; Add tests for toplevel expressions in static compiler, especially string 
;; Figure out tests for string

(def defmacro
     (lambda (name args &body)
        `((lambda ()
            (def ~name (lambda ~args ~@body))
            (setmac! ~name)))))

(setmac! defmacro)

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
        `(if ~(car args) true ~(cons 'or (cdr args)))))

(defun macroexpand (expr)
    (if (and (list? expr) (macro? (geti *ns* (car expr))))
        (apply (geti *ns* (car expr)) (cdr expr))
        expr))

(defun inc (x) (+ x 1))
(defun dec (x) (- x 1))

(defmacro inc! (name) `(setv! ~name (+ ~name 1)))
(defmacro dec! (name) `(setv! ~name (- ~name 1)))

(def first car)
(defun second (lst) (car (cdr lst)))
(defun third (lst) (car (car (cdr lst))))
(defun fourth (lst) (car (car (car (cdr lst)))))
(defun fifth (lst) (car (car (car (car (cdr lst))))))

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
    (let-helper* '() (zip (every-nth 2 bindings) (every-nth 2 (cdr bindings))) body))

(defun destruct-helper (structure expr)
    (let (expr-name (gensym))
        `(~expr-name ~expr
          ~@(apply concat (map-indexed (lambda (v idx)
                                                (if (symbol? v)
                                                    (if (= (. v name 0) "&")
                                                        `(~(symbol (. v name slice (1))) (drop ~idx ~expr-name))
                                                        `(~v (nth ~idx ~expr-name)))
                                                    (destruct-helper v `(nth ~idx ~expr-name))))
                                            structure)))))

(defmacro destructuring-bind (structure expr &body)
    `(let* ~(destruct-helper structure expr)
        ~@body))

(defmacro case (e &pairs)
    (let* (e-name (gensym)
           def-idx (find equal? 'default pairs)
           def-expr (if (= def-idx -1) '(error "Fell out of case!") (nth (inc def-idx) pairs))
           zipped-pairs (zip (every-nth 2 pairs) (every-nth 2 (cdr pairs))))
        `(let (~e-name ~e)
            (cond ~@(apply concat
                            (map (lambda (pair) (list `(= ~e-name (quote ~(first pair))) (second pair)))   
                                 (filter (lambda (pair) (not (equal? (car pair) 'default))) zipped-pairs)))
                    true ~def-expr))))

;(defun pprint (expr)
;    (if (and (list? expr) (not (null? expr)))
;        (case (car expr)
;            lambda (print (
            
            
;(print (destructuring-bind (a (b (c &more)) &etc) '(1 (2 (3 4 5)) 6 7) (+ (+ a b c) (apply + more) (apply + etc))))


;(print (macroexpand '(let* (gs1 (quote (1 2 (3 4)))
;       a (nth 0 gs1)
;       b (nth 1 gs1)
;       gs2 (nth 2 gs1)
;       c (nth 0 gs2)
;       d (nth 1 gs2))
;    (+ a b c))))

;(print (destructuring-bind (a b (c d)) '(1 2 (3 4)) (+ a b c)))

;(print (destructuring-bind (a b (c d)) '(1 2 (3 4))
;         (+ a b)))
