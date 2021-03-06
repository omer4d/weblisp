;; Add tests for name mangling, epecially in static compiler
;; Add tests for toplevel expressions in static compiler, especially string 
;; Figure out tests for string

(def VM (require "vm"))
(def Reflect (require "harmony-reflect"))
(def path (require "path"))
(def fs (require "fs"))

(def node-evaluator-proto (object))

(defun gen-jstr (pair)
  (str (. (second pair) data) (. (first pair) data)))

(defun default-lexenv ()
  (doto (object)
    (seti! "this" true)))

(defmethod init node-evaluator-proto (self)
  (let (root (make-default-ns)
	sandbox (object))
    (seti! sandbox "$$root" root)
    (. VM (createContext sandbox))
    (seti! root "jeval" (lambda (str) (. VM (runInContext str sandbox))))
    (seti! root "load-file" (lambda (path) (. self (load-file path))))
    (doto self
       (seti! "root" root)
       (seti! "dir-stack" (list (.cwd process)))
       (seti! "compiler" (make-instance compiler-proto root)))))

(defmethod eval node-evaluator-proto (self expr)
  (let (tmp (. self compiler (compile (default-lexenv) expr)))
    (. self root (jeval (gen-jstr tmp)))))

(defmethod eval-str node-evaluator-proto (self s)
  (let (forms (parse (tokenize s)))
    (iterate (for form (in-list forms))
	     (do (. self (eval form))))))

(defmethod load-file node-evaluator-proto (self path)
  undefined)

;; *******************
;; * Static Compiler *
;; *******************

(def lazy-def-proto (object))

(defmethod init lazy-def-proto (self compilation-result)
  (seti! self 'code (gen-jstr compilation-result)))

(def static-compiler-proto (object compiler-proto))

(defmethod init static-compiler-proto (self)
  (let* (root (make-default-ns)
	 sandbox (object)
	 handler (object)
	 next-gensym-suffix 0)
    (seti! handler 'get (lambda (target name)
			  (let (r (geti target name))
			    (when (prototype? lazy-def-proto r)
			      (set! r (. root (jeval (. r code))))
			      (seti! target name r))
			    r)))
    (seti! sandbox "$$root" (Proxy root handler))
    (. VM (createContext sandbox))
    (seti! root "jeval" (lambda (s) (. VM (runInContext s sandbox))))
    (seti! root "*ns*" (. sandbox "$$root"))
    (seti! root "gensym" (lambda () (symbol (str "__GS" (inc! next-gensym-suffix)))))
    (call-method (. compiler-proto init) self root)))

(defmethod compile-toplevel static-compiler-proto (self e)
  (let (lexenv (default-lexenv))
    (pattern-case e
      ('def name val) (let (tmp (. self (compile lexenv e)))
			(seti! (. self root) name (make-instance lazy-def-proto tmp))
			(concat-tc-str (second tmp) (first tmp)))

      ('setmac! name) (let (tmp (. self (compile lexenv e)))
			(. self root (jeval (gen-jstr tmp)))
			(concat-tc-str (second tmp) (first tmp)))

      ('progn &body) (join-tc-strs ";" (map (partial-method self 'compile-toplevel) body))
      
      (name &args) (if (. self (is-macro name))
		       (. self (compile-toplevel (. self (macroexpand-unsafe lexenv e))))
		       (let (tmp (. self (compile lexenv e)))
			 (concat-tc-str (second tmp) (first tmp))))

      any (let (tmp (. self (compile lexenv e)))
	    (concat-tc-str (second tmp) (first tmp))))))

(defmethod compile-unit static-compiler-proto (self s)
  (reduce (lambda (accum v)
	    (concat-tc-str accum v (str->tc ";")))
	  (map (partial-method self 'compile-toplevel) (parse (tokenize s)))
	  (str->tc "")))

  ;(join-tc-strs ";" (map (partial-method self 'compile-toplevel) (parse (tokenize s)))))

;(let* (e (make-node-evaluator)
;       ev (lambda (s) (. e eval-str (s))))
;  (print (ev (str "(setv! testmac2 (lambda () 'baz))"
;		  "(setmac! testmac2)"
;		  "((lambda (baz) (+ (testmac2) 5)) 5)"))))

(def %inspect% (. (require "util") inspect))
(defun inspect (obj) (%inspect% obj true 10))

;(let (c (make-instance compiler-proto (object *ns*)))
;  (print (. c (compile (object) '(lambda (x y z &more) (+ 1 2 3))))))

;(let (c (make-instance static-compiler-proto ()))
;  (inspect (. c (compile-unit "(progn (+ 1 2 3) (+ 4 5 6)) (progn (+ 5 6))"))))

;  (print (. c (compile (object) '(lambda (x y z &more) (+ 1 2 3))))))

(export 'root *ns*)
