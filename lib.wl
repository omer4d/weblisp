(def defmacro
    (lambda (name args &body)
      `((lambda ()
	  (def ~name (lambda ~args ~@body))
	  (setmac! ~name)))))

(setmac! defmacro)

(defmacro defun (name args &body)
  `(def ~name (lambda ~args ~@body)))
 
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

(defun identity (x) x)
(defun even? (x) (= (mod x 2) 0))
(defun odd? (x) (= (mod x 2) 1))

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

(defun interleave (&args)
  (if (null? args)
      '()
      (apply concat (apply zip args))))

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

;(defmacro loop (bindings &body)
;  `(let (recur null)
;     (setv! recur (lambda ~(every-nth 2 bindings) ~@body))
;     (recur ~@(every-nth 2 (cdr bindings)))))

(defmacro loop (bindings &body)
  (let (binding-names (every-nth 2 bindings)
	tmp-binding-names (map (lambda (s) (symbol (str "_" (. s name)))) (every-nth 2 bindings))
        done-flag-sym (gensym)
        res-sym (gensym))
    `(let (~done-flag-sym false
	   ~res-sym undefined
	   ~@bindings)
       (let (recur (lambda ~tmp-binding-names
		     ~@(map (lambda (s) `(setv! ~s ~(symbol (str "_" (. s name))))) binding-names)
		     (setv! ~done-flag-sym false)))
	 (dumb-loop
	  (setv! ~done-flag-sym true)
	  (setv! ~res-sym ~@body)
	  (if (not ~done-flag-sym)
	      (continue)
	      ~res-sym))))))

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

;(defun geti-safe (obj name)
;  (if (in? name obj)
;      (geti obj name)
;      (error (str "Property "))))

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

(defmacro . (obj-name &fields)
  (dot-helper obj-name (reverse fields)))

(defun at-helper (obj-name reversed-fields)
  (if (null? reversed-fields)
      obj-name
      `(geti ~(at-helper obj-name (cdr reversed-fields)) ~(car reversed-fields))))

(defmacro @ (obj-name &fields)
  (at-helper obj-name (reverse fields)))

(defun prototype? (p o)
  (. p (isPrototypeOf o)))

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
       (replace
	rx (lambda (match)
	     (nth (parseInt (. match (substring 1))) (cdr args)))))))

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
				      `(~(symbol (. v name (slice 1))) (drop ~idx ~expr-name))
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
     ('geti-safe obj field) `(seti! ~obj ~field ~v)
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

(defmacro push! (x place)
  `(set! ~place (push ~x ~place)))

(defmacro cons! (x place)
  `(set! ~place (cons ~x ~place)))

(defun insert (x pos lst)
  (if (= pos 0)
      (cons x lst)
      (cons (if (null? lst) undefined (car lst)) (insert x (dec pos) (cdr lst)))))

(defmacro -> (x &forms)
  (if (null? forms)
      x
      `(-> ~(push x (car forms)) ~@(cdr forms))))

(defmacro ->> (x &forms)
  (if (null? forms)
      x
      `(->> ~(insert x 1 (car forms)) ~@(cdr forms))))

(defmacro doto (obj-expr &body)
  (let (binding-name (gensym))
    `(let (~binding-name ~obj-expr)
       ~@(map (lambda (v)
		(destructuring-bind (f &args) v
		  (cons f (cons binding-name args))))
	      body)
       ~binding-name)))

(defun assoc! (obj &kvs)
  (loop (kvs kvs)
     (if (null? kvs)
	 obj
	 (progn
	   (seti! obj (first kvs) (second kvs))
	   (recur (cdr (cdr kvs)))))))

(defun deep-assoc! (obj path &kvs)
  (loop (obj obj
	 path path
	 kvs kvs)
     (if (null? path)
	 (apply assoc! (cons obj kvs))
	 (recur (if (in? (car path) obj)
		    (geti obj (car path))
		    (seti! obj (car path) (hashmap)))
		(cdr path) kvs)))
  obj)

(defun deep-geti* (obj path)
  (if (null? path)
      obj
      (let (tmp (geti obj (car path)))
	(if tmp (deep-geti* tmp (cdr path)) undefined))))

(defun deep-geti (obj &path)
  (deep-geti* obj path))

(defun hashmap-shallow-copy (h1)
  (reduce (lambda (h2 key) (seti! h2 key (geti h1 key)) h2) (keys h1) (hashmap)))

(defun assoc (h &kvs)
  (apply assoc! (cons (hashmap-shallow-copy h) kvs)))

(defun update! (h &kfs)
  (loop (kfs kfs)
     (if (null? kfs)
	 h
	 (let (key (first kfs))
	   (seti! h key ((second kfs) (geti h key)))
	   (recur (cdr (cdr kfs)))))))

(defun update (h &kfs)
  (apply update! (cons (hashmap-shallow-copy h) kfs)))

(defmacro while (c &body)
  `(loop ()
      (when ~c
	~@body
	(recur))))

(defun sort (cmp lst)
  (. lst (sort cmp)))

(defun in-range (binding-name start end step)
  (set! step (or step 1))
  (let (data (object null))
    (set! (. data bind) (list binding-name start))
    (set! (. data post) `((inc! ~binding-name ~step)))
    (set! (. data cond) `(< ~binding-name ~end))
    data))

(defun from (binding-name start step)
  (set! step (or step 1))
  (let (data (object null))
    (set! (. data bind) (list binding-name start))
    (set! (. data post) `((inc! ~binding-name ~step)))
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

(defun add-meta! (obj &kvs)
  (let (meta (geti obj 'meta))
    (when (not meta)
      (set! meta (hashmap))
      (set! (. obj meta) meta)
      (.defineProperty Object obj "meta" (assoc! (hashmap) "enumerable" false "writable" true)))
    (apply assoc! (cons meta kvs))
    obj))

(defun print-meta (x)
  (print (.stringify JSON (. x meta))))

(defmacro defpod (name &fields)
  `(defun ~(symbol (str "make-" name)) ~fields
     (doto (hashmap) ~@(map (lambda (field) `(seti! (quote ~field) ~field)) fields))))

(defun subs (s start end)
  (.slice s start end))

(defun neg? (x) (< x 0))

(defun idiv (a b)
  (let (t (/ a b))
    (if (neg? t) (.ceil Math t) (.floor Math t))))

(defun empty? (x)
  (cond
    (string? x) (= (. x length) 0)
    (list? x) (null? x)
    true (error "Type error in empty?")))
