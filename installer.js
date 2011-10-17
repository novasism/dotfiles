// Dependecies
var glob = require('glob'),
fs       = require('fs'),
path     = require('path'),
util     = require('util'),
events   = require('events')
readline = require('readline');

var _File;

var Installer = function () {
	this.files = [];
	this.currentFile = null;

	this.findFiles( this.processFiles );
};

Installer.BASE_PATH = path.join( process.env.HOME, '/Development/dotfiles-test');

Installer.prototype.findFiles = function (cb) {
	var self = this;

	glob('*/*.symlink', function (err, matches) {
		self.files = matches;

		cb.call( self );
	});
};

Installer.prototype.processFiles = function () {
	var self = this;

	if (!this.files.length) {
		throw new Error('No files to process');
	}

	// Use next file in stack
	this.handleFile( this.files.pop(), function nextFile () {
		self.files.length && self.handleFile( self.files.pop(), nextFile );
	});
};

Installer.prototype.handleFile = (function (file, cb) {
	var i;

	function closePrompt() {
		i.close();
		process.stdin.destroy();
	}

	function stdin (input) {
		var close = true;

		switch (input) {
			case 'o':
			case 'overwrite':
				console.log('overwrite');
				break;

			case 'b':
			case 'backup':
				console.log('backup');
				break;

			case 'q':
			case 'quit':
				closePrompt();

				return;

			case '?':
				console.log('o = overwrite \nb = backup \nq = quit \n? = help');
				close = false;

				break;

			default:
				console.log('Huh?!?');
				close = false;

				break;
		}

		if (close) {
			closePrompt();
		} else {
			i.prompt();
		}
	}

	return function (file, cb) {
		file = file.replace(/^(.+[^\/])\/?/, '$1');

		this.currentFile = new this.File( file, cb );
		this.currentFile.on('file exists', function (data) {
			i = readline.createInterface(process.stdin, process.stdout, null);

			i.question('File ' + data.fileName + ' already exists, what do you want to do? [o,b,q,?]\n', stdin);
			i.on('line', stdin);
		});

		this.currentFile.on('file transfer complete', cb);

		this.currentFile.symlink();
	}
}());

Installer.prototype.File = function (file, cb) {
	this.callback = cb;

	this.fileName = file.split('/').slice(-1)[0].split('.symlink')[0];
	this.filePath = path.join( process.cwd(), file );
	this.targetFile = path.join(Installer.BASE_PATH, '/', '.' + this.fileName);
};
_File = Installer.prototype.File;
util.inherits( _File, events.EventEmitter );

_File.prototype.overwrite = function () {};
_File.prototype.backup = function () {};
_File.prototype.symlink = function () {
	var self = this;

	if (path.existsSync( this.targetFile )) {
		this.emit('file exists', this);
	} else {
		fs.symlink( this.filePath, this.targetFile, function () {
			self.emit('file transfer complete', self);
		});
	}
};

new Installer;
