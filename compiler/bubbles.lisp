;(.log console "BAZ!")
;(.log console )

(def renderer (.autoDetectRenderer PIXI 480 800
				   (doto (object)
					 (seti! 'backgroundColor 1087931)
					 (seti! 'resolution 1))))

(. (get-document) body (appendChild (. renderer view)))

(def stage (new (. PIXI Container)))

(.log console stage)

(def texture (. PIXI Texture (fromImage "res/char.png")))

(def sprite (new (. PIXI Sprite) texture))

(set! (. sprite anchor x) 0.5)
(set! (. sprite anchor y) 0.5)
(set! (. sprite position x) 200)
(set! (. sprite position y) 150)

(.addChild stage sprite)

(defun request-frame (callback)
  (call-method requestAnimationFrame (get-window) callback))

(defun animate()
  (inc! (. sprite x) 2)
  (.render renderer stage)
  (request-frame animate))

(request-frame animate)

(defun rgb->hex (r g b)
  (+ (shl (* r 255) 16)  (shl (* g 255) 8) (* b 255)))


(defun random-int (min max)
  (.floor Math (+ min (* (.random Math) (- max min)))))

(defun idiv (x y) (.floor Math (/ x y)))

(defmacro defproto (name &fields)
  `(progn
     (def ~name (object))
     (seti! ~name 'tag (quote ~name))
     (defmethod init ~name (self ~@fields)
       ~@(map (lambda (field) `(seti! self (quote ~field) ~field)) fields))))

(def bub-groups '(red green blue cyan magenta yellow))

(defproto *bubble* group graphic x y vx vy)

(defun move (bub dt)
  (doto bub
    (inc! (. bub x) (* (. bub vx) dt))
    (int! (. bub y) (* (. bub vy) dt))))

(defun bub-group->color (g)
  (case g
    red      (rgb->hex 1 0 0)
    green    (rgb->hex 0 1 0)
    blue     (rgb->hex 0 0 1)
    cyan     (rgb->hex 0 1 1)
    magenta  (rgb->hex 1 0 1)
    yellow   (rgb->hex 1 1 0)))

(defun make-random-bub (x y rad)
  (let (group (nth (random-int 0 (count bub-groups)) bub-groups))
    (make-instance
     *bubble*
     group
     (doto (new (. PIXI Graphics))
       (.beginFill (bub-group->color group))
       (.drawCircle 0 0 rad)
       (.endFill)
       (seti! 'x x)
       (seti! 'y y))
     x y 0 0)))

(def *grid* (object))

(defmethod init *grid* (self rows cols)
    (iterate (for i (in-range 0 rows))
      (do (set! (@ mat i) (array cols))
	  (iterate (for j (in-range 0 cols))
	    (do (set! (@ mat i j) null)))))
    (iterate (for i (in-range 0 (idiv rows 2)))
      (do (iterate (for j (in-range 0 cols))
	    (do (set! (@ mat i j) (make-random-bub 0 0 20))))))
    (set! (. self mat) mat))

;(defmethod logic *grid* (self dt)
  

(.log console (make-instance *grid* 4 3))
;(print (macroexpand-1 '(@ blah i j k)))

  
