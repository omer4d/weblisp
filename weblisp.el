(define-derived-mode
  weblisp-mode lisp-mode "Weblisp"
  "Major mode")

(defun weblisp-repl () (interactive)
  (pop-to-buffer (make-comint "weblisp-repl" "C:/Users/Omer/Desktop/weblisp/njs-repl.bat" nil)))

(defun get-curr-sexp ()
  (interactive)
  (save-excursion
    (re-search-backward "[^[:space:]]")
    (when (not (eql (following-char) ?\)))
      (forward-char))
    (thing-at-point 'sexp)))

(defun append-string-to-buffer (string buffer)
  "Append STRING to the end of BUFFER."
  (with-current-buffer buffer
    (save-excursion
      (goto-char (point-max))
      (insert string))))

(defun weblisp-eval (str)
  (process-send-string (get-buffer-process "*weblisp-repl*") (concat str "\n" (char-to-string 4))))

(defun weblisp-eval-curr-sexp ()
  (interactive)
  (weblisp-eval (get-curr-sexp)))

(defun weblisp-macroexpand-1 ()
  (interactive)
  (weblisp-eval (concat "(macroexpand-1 '" (get-curr-sexp) ")")))

(defun weblisp-eval-buffer ()
  (interactive)
  (weblisp-eval (buffer-string)))


(add-hook 'weblisp-mode-hook
	  (lambda ()
	    (slime-mode 0)))

(define-key weblisp-mode-map (kbd "C-x C-e") 'weblisp-eval-curr-sexp)
(define-key weblisp-mode-map (kbd "C-c C-l") 'weblisp-eval-buffer)
(define-key weblisp-mode-map (kbd "C-x M-m") 'weblisp-macroexpand-1)

(provide 'weblisp)
