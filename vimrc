" Use Vim settings, rather then Vi settings (much better!).
" This must be first, because it changes other options as a side effect.
set nocompatible
syntax on
colorscheme Tomorrow-Night

set number

set guifont=Menlo:h14

set enc=utf8

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

"Always show the status line
set laststatus=2

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
" highlight NonText guifg=#cccccc
" highlight SpecialKey guifg=#cccccc

" Color status bar of current split
hi StatusLine guifg=#CD5907 guibg=fg
hi StatusLineNC guifg=#808080 guibg=#080808

"Exit insert mode with jj
inoremap jj <ESC>

" Source the vimrc file after saving it
if has("autocmd")
  autocmd bufwritepost .vimrc source $MYVIMRC
endif

