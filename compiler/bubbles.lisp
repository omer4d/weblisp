(def request-frame (or (. window requestAnimationFrame)
		       (. window webkitRequestAnimationFrame)
		       (. window mozRequestAnimationFrame)
		       (. window oRequestAnimationFrame)
		       (. window msRequestAnimationFrame)
		       (lambda (callback)
			 (. window setTimeout (callback (/ 1000 60))))))

(defun dot-helper2 (obj-name reversed-fields)
  (if (null? reversed-fields)
      obj-name
      `(geti ~(dot-helper obj-name (cdr reversed-fields)) (quote ~(car reversed-fields)))))

(defmacro . (obj-name &fields)
  (let (rev-fields (reverse fields))
    (if (list? (car rev-fields))
	`(let (target ~(dot-helper obj-name (cdr (cdr rev-fields))))
	   (call-method (geti target (quote ~(second rev-fields))) target ~@(first rev-fields)))
	(dot-helper obj-name rev-fields))))
