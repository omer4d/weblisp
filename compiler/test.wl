(def defmacro
     (lambda (name args &body)
        `((lambda ()
            (def ~name (lambda ~args ~@body))
            (setmac! ~name)))))

(setmac! defmacro)

(defmacro defun (name args &body)
    `(def ~name (lambda ~args ~@body)))

(defun baz (x &more) more)