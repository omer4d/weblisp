;(.log console "BAZ!")
;(.log console (doto (object) (seti! 'backgroundColor 1087931)))

(def renderer (.autoDetectRenderer PIXI 800 600))

(. (get-document) body (appendChild (. renderer view)))

(def stage (new (. PIXI Container)))

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
