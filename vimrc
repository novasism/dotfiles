" Use Vim settings, rather then Vi settings (much better!).
" This must be first, because it changes other options as a side effect.
set nocompatible

syntax on

set number

set guifont=Monaco:h12

" Tabs
set tabstop=4
set shiftwidth=4
set softtabstop=4

set smartindent
set autoindent

"Display current cursor position in lower right corner.
set ruler

"Show command in bottom right portion of the screen
set showcmd

" case insensitive search
set ignorecase
set smartcase

"Hide MacVim toolbar by default
set go-=T

"Auto close tags (http://www.vim.org/scripts/script.php?script_id=2591)
au FileType xhtml,html,xml so ~/.vim/ftplugin/html_autoclosetag.vim

"Show hidden characters
set list
set listchars=tab:▸\ ,eol:¬

"Invisible character colors
highlight NonText guifg=#cccccc
highlight SpecialKey guifg=#cccccc

"Exit insert mode with jj
inoremap jj <ESC>
