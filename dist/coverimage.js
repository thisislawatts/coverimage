var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var elementResizeDetectorMaker = require('element-resize-detector');

var CoverImage = function () {
	function CoverImage(el, cb) {
		_classCallCheck(this, CoverImage);

		var _this = this;

		_this.$el = el ? el : window;
		_this.$img = _this.getElementForSizing();
		_this.disableOnMobile = _this.$el.dataset['cover-image-mobile'] === 'false';
		_this.cb = cb || function () {
			//DEBUG console.log("Default callback");
		};

		_this.positioning = {
			x: 0.5,
			y: 0.5
		};
		_this.options = {
			parallax: _this.$el.dataset.coverImageParallax === 'true'
		};

		if (!_this.$img) {
			console.log('Error:', 'no image found', _this.$img);
			return;
		}

		_this.imageWidth = _this.$img.getAttribute('width');
		_this.imageHeight = _this.$img.getAttribute('height');

		// If the image doesn't have harcoded width|height
		// attributes then load the image to calculate
		// the dimensions
		if (!_this.imageWidth || !_this.imageHeight) {
			console.log('No dimensions found. Generating image:', _this.$img.src);
			_this.img = new Image();
			_this.img.src = _this.$img.src;

			_this.imageWidth = _this.img.width;
			_this.imageHeight = _this.img.height;
		}

		if (_this.disableOnMobile && window.innerWidth < 480) {
			return;
		}

		_this.elementDimensions = {
			height: _this.$el.clientHeight,
			width: _this.$el.clientWidth
		};

		_this.$el.style = '\n\t\t\toverflow : hidden;\n\t\t\tposition : relative;\n\t\t';

		if (!_this.$img) {
			// TODO: Implement load
			setTimeout(function () {
				new CoverImage(_this.$el);
			}, 1000);
		} else {
			_this.resizeImage();
		}

		_this.$img.addEventListener('load', function () {
			_this.resizeImage();
		}, false);

		_this.$el.addEventListener('transitionend', function () {
			_this.resizeImage();
		}, false);

		var erd = elementResizeDetectorMaker({
			strategy: 'scroll'
		});

		erd.listenTo(_this.$el, function () {
			_this.resizeImage();
		});

		_this.$el.addEventListener('animationend', function () {
			_this.resizeImage();
		}, false);

		window.addEventListener('resize', function () {
			_this.resizeImage();
		}, true);

		window.addEventListener('ci.resize', function () {
			_this.resizeImage();
		}, true);

		if (_this.options.parallax) {
			_this.draw();
		}
	}

	/**
  * Parallax FX
  *
  */


	_createClass(CoverImage, [{
		key: 'draw',
		value: function draw() {
			var _this = this;
			var friction = 0.5;
			var imageOffsetX = document.body.scrollTop * friction;
			var imageOffsetY = document.body.scrollTop * friction;
			var maximumMovementY = (_this.imageDimensions.height - _this.elementDimensions.height) * _this.positioning.y;
			var maximumMovementX = (_this.imageDimensions.width - _this.elementDimensions.width) * _this.positioning.x;

			if (maximumMovementX > 0) {
				if (imageOffsetX < maximumMovementX) {
					// console.log('New position:', maximumMovementX - imageOffsetX);
					_this.$img.css({
						'transform': 'translateX(' + (maximumMovementX - imageOffsetX) + 'px)'
					});
				}
			} else {
				if (imageOffsetY < maximumMovementY) {
					_this.$img.css('transform', 'translateY(' + (maximumMovementY - imageOffsetY) + 'px)');
				}
			}

			window.requestAnimationFrame(function () {
				_this.draw();
			});
		}

		/**
   *
   * @return DOM Element
   */

	}, {
		key: 'getElementForSizing',
		value: function getElementForSizing() {
			var _this = this;
			var selector = _this.$el.dataset['coverImageEl'];

			if (selector) {

				console.log('Element selector Present', _this.$el.find(selector));

				return _this.$el.find(selector) ? _this.$el.find(selector) : _this.$el.find('img');
			}

			return _this.$el.querySelector('img');
		}
	}, {
		key: 'resizeImage',
		value: function resizeImage() {
			var _this = this;
			var elementWidth = _this.$el.clientWidth;
			var elementHeight = _this.$el.clientHeight;
			var dimensions = _this.coverDimensions(_this.imageWidth, _this.imageHeight, elementWidth, elementHeight);

			_this.imageDimensions = dimensions;

			if (isNaN(dimensions.width)) {
				console.log('Failed to calculate image sizes.');
			}

			_this.setImageSize();
		}
	}, {
		key: 'setImageSize',
		value: function setImageSize() {
			var _this = this;

			_this.$img.width = _this.imageDimensions.width;
			_this.$img.height = _this.imageDimensions.height;

			var transform = _this.getTransform((_this.$el.clientWidth - _this.imageDimensions.width) * _this.positioning.y, (_this.$el.clientHeight - _this.imageDimensions.height) * _this.positioning.x);

			_this.$img.style = '\n\t\t\tposition: absolute;\n\t\t\twidth: ' + _this.imageDimensions.width + ';\n\t\t\theight: ' + _this.imageDimensions.height + ';\n\t\t\ttransform: ' + transform + ';\n\t\t\tmax-width: none;\n\t\t';

			_this.$img.classList.add('ci--sized');
			_this.cb();
		}
	}, {
		key: 'getTransform',
		value: function getTransform(x, y) {
			return 'translate3d(' + x + 'px,' + y + 'px,0)';
		}
	}, {
		key: 'coverDimensions',
		value: function coverDimensions(child_w, child_h, container_w, container_h) {
			var scale_factor = this.max(container_w / child_w, container_h / child_h);

			return {
				width: Math.ceil(child_w * scale_factor),
				height: Math.ceil(child_h * scale_factor)
			};
		}
	}, {
		key: 'containDimensions',
		value: function containDimensions(child_w, child_h, container_w, container_h) {
			var scale_factor = this.min(container_w / child_w, container_h / child_h);

			return {
				width: child_w * scale_factor,
				height: child_h * scale_factor
			};
		}
	}, {
		key: 'min',
		value: function min(a, b) {
			return a > b ? b : a;
		}
	}, {
		key: 'max',
		value: function max(a, b) {
			return a > b ? a : b;
		}
	}]);

	return CoverImage;
}();

var elems = document.body.querySelectorAll('[data-cover-image]');

elems.forEach(function (el) {
	new CoverImage(el);
});