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
    `(lambda () ~@body))

(defmacro inc! (name) `(setv! ~name (+ ~name 1)))

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

(defun every-nth (n lst)
    ((lambda (counter)
        (transform-list
            (lambda (accum v)
                (if (= (mod (inc! counter) n) 0) (cons v accum) accum))
            lst)) -1))
            
(defmacro let (bindings &body)
    `((lambda ~(every-nth 2 bindings)
        ~@body) ~@(every-nth 2 (cdr bindings))))

(print (every-nth 2 (cdr '(0 1 2 3 4 5 6 7 8 9))))

(let (x 10 y (+ 10 10))
    (let (z 100 w 200)
        (print (+ x y z w))))

(let (o (object))
  (seti! o "baz" 50)
  (seti! o "foo" 20)
  (print (+ (geti o "baz") (geti o "foo"))))