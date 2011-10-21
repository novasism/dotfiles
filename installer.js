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

	this._interface = readline.createInterface(process.stdin, process.stdout, null);

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
	function nextFile () {
		console.log(self.files.length);
		if (self.files.length) {
			self.handleFile( self.files.pop(), nextFile );
		} else {
			self._closePrompt();
		}
	};

	this.handleFile( this.files.pop(), nextFile );
};

Installer.prototype.handleFile = function (file, cb) {
	var self = this;

	file = file.replace(/^(.+[^\/])\/?/, '$1');

	this.currentFile = new this.File( file, cb );

	this.currentFile.on('file exists', function (data) {
		self._interface.question(
			'File ' + data.fileName + ' already exists, what do you want to do? [o,b,q,?]\n',
			self._stdin.bind( self ) 
		);
		self._interface.on('line', self._stdin.bind( self ));
	});

	this.currentFile.on('file transfer complete', cb);

	this.currentFile.symlink();
};

Installer.prototype._stdin = function (input) {
	switch (input) {
		case 'o':
		case 'overwrite':
			console.log('overwrite');
			console.log(this.currentFile);
			this.currentFile.overwrite();
			break;

		case 'b':
		case 'backup':
			console.log('backup');
			break;

		case 'q':
		case 'quit':
			this._closePrompt();

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

	this._interface.prompt();
}

Installer.prototype._closePrompt = function () {
	this._interface.close();
	process.stdin.destroy();
}

Installer.prototype.File = function (file, cb) {
	this.callback = cb;

	this.fileName = file.split('/').slice(-1)[0].split('.symlink')[0];
	this.filePath = path.join( process.cwd(), file );
	this.targetFile = path.join(Installer.BASE_PATH, '/', '.' + this.fileName);
};


_File = Installer.prototype.File;
util.inherits( _File, events.EventEmitter );

_File.prototype.overwrite = function () {
	var self = this;

	fs.unlink( this.targetFile, function (err) {
		if (err) {
			throw err;
		}
		
		self.symlink();
	});
};
_File.prototype.backup = function () {};
_File.prototype.symlink = function () {
	var self = this;

	if (path.existsSync( this.targetFile )) {
		this.emit('file exists', this);
	} else {
		fs.symlink( this.filePath, this.targetFile, function () {
		//	self.emit('file transfer complete', self);
		});
	}
};

new Installer;
