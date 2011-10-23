// Dependecies
var glob, fs, path, util, events, readline;

try {
	glob     = require('glob');
	fs       = require('fs');
	path     = require('path');
	util     = require('util');
	events   = require('events');
	readline = require('readline');
} catch (e) {
	console.log(e.message);

	process.exit(1);
}

var File;

var Installer = function () {
	this.files = [];
	this.currentFile = null;
	this.backupAll = this.overwriteAll = false;

	this._interface = readline.createInterface(process.stdin, process.stdout, null);
	this._interface.on('line', this._stdin.bind( this ));

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

	this.handleFile( this.files.pop(), this._nextFile );
};

Installer.prototype._nextFile = function () {
	if (this.files.length) {
		this.handleFile( this.files.pop(), this._nextFile );
	} else {
		this.exit();
	}
};

Installer.prototype.handleFile = function (file) {
	var self = this;

	file = file.replace(/^(.+[^\/])\/?/, '$1');
	this.currentFile = new File( file );

	this.currentFile.on('file exists', function (data) {
		if (self.backupAll) {
			self.currentFile.backup();
		} else if (self.overwriteAll) {
			self.currentFile.overwrite();
		} else {
			console.log('File %s already exists, what do you want to do? [o,O,b,B,s,S,q,?]', data.fileName);
			self._interface.prompt();

			return;
		}

		self.exit();
	});

	this.currentFile.on('file transfer complete', this._nextFile.bind( this ));

	this.currentFile.symlink();
};

Installer.prototype._stdin = function (input) {
	switch (input) {
		case 'o':
			this.currentFile.overwrite();
			break;

		case 'O':
			this.overwriteAll = true;
			this.currentFile.overwrite();
			break;

		case 'b':
			this.currentFile.backup();
			break;

		case 'B':
			this.backupAll = true;
			this.currentFile.backup();
			break;

		case 's':
			this._nextFile();
			break;

		case 'S':
		case 'q':
			this.exit();
			break;

		case '?':
			console.log('o = overwrite \nb = backup \nq = quit \n? = help');
			break;

		default:
			console.log('Huh?!?');
			break;
	}
};

Installer.prototype.exit = function (exitCode) {
	this._interface.close();
	process.stdin.destroy();

	process.exit( exitCode || 0 );
};

File = function (file, cb) {
	this.fileName = file.split('/').slice(-1)[0].split('.symlink')[0];
	this.filePath = path.join( process.cwd(), file );
	this.targetFile = path.join(Installer.BASE_PATH, '/', '.' + this.fileName);
};
util.inherits( File, events.EventEmitter );

File.prototype.overwrite = function () {
	var self = this;

	fs.unlink( this.targetFile, function (err) {
		if (err) {
			throw err;
		}
		
		self.symlink();
	});
};

File.prototype.backup = function () {
	var self = this,
		backupLocation = this.targetFile + '.bak';
	
	if (path.existsSync( backupLocation )) {
		fs.unlinkSync( backupLocation );
	}

	fs.rename( this.targetFile, backupLocation, function (err) {
		if (err) {
			throw err;
		}

		console.log('Backing up %s to %s', self.targetFile, backupLocation);
		
		self.symlink();
	});
};

File.prototype.symlink = function () {
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

