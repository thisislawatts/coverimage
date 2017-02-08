'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CoverImage = function () {
	function CoverImage($el, cb) {
		_classCallCheck(this, CoverImage);

		var _this = this;

		_this.$el = $el ? jQuery($el) : jQuery(window);
		_this.$img = _this.getElementForSizing();
		_this.disableOnMobile = _this.$el.data('cover-image-mobile') === false;
		_this.cb = cb || function () {
			//DEBUG console.log("Default callback");
		};
		_this.positioning = {
			x: 0.5,
			y: 0.5
		};
		_this.options = {
			parallax: _this.$el.data('coverImageParallax') === ''
		};

		if (!_this.$img) {
			console.log('Error:', 'no image found', _this.$img);
			return;
		}

		_this.imageWidth = _this.$img.attr('width');
		_this.imageHeight = _this.$img.attr('height');

		// If the image doesn't have harcoded width|height
		// attributes then load the image to calculate
		// the dimensions
		if (!_this.imageWidth || !_this.imageHeight) {
			console.log('No dimensions found. Generating image');
			_this.img = new Image();
			_this.img.src = _this.$img.attr('src');

			_this.imageWidth = _this.img.width;
			_this.imageHeight = _this.img.height;
		}

		if (_this.disableOnMobile && window.innerWidth < 480) {
			return;
		}

		_this.elementDimensions = {
			height: _this.$el.outerHeight(),
			width: _this.$el.outerWidth()
		};

		_this.$el.css({
			overflow: 'hidden',
			position: 'relative'
		});

		if (!_this.$img.length) {

			// TODO: Implement load
			setTimeout(function () {
				new CoverImage(_this.$el);
			}, 1000);
		} else {
			_this.resizeImage();
		}

		_this.$img.one('load', function () {
			console.log('Image loaded:', 'resize');
			_this.resizeImage();
		});

		$(window).on('resize', function () {
			_this.resizeImage();
		});

		$(window).on('ci.resize', function () {
			_this.resizeImage();
		});

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
	}, {
		key: 'getElementForSizing',
		value: function getElementForSizing() {
			var _this = this;
			var selector = _this.$el.data('coverImageEl');

			if (selector) {

				console.log('Element selector Present', _this.$el.find(selector));

				return _this.$el.find(selector) ? _this.$el.find(selector) : _this.$el.find('img');
			}

			return _this.$el.find('img').first();
		}
	}, {
		key: 'resizeImage',
		value: function resizeImage() {
			var _this = this;
			var dimensions = _this.coverDimensions(_this.imageWidth, _this.imageHeight, _this.$el.outerWidth(), _this.$el.outerHeight());

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

			_this.$img.attr({
				'width': _this.imageDimensions.width,
				'height': _this.imageDimensions.height
			}).css({
				'position': 'absolute',
				'width': _this.imageDimensions.width,
				'height': _this.imageDimensions.height,
				'transform': _this.getTransform((_this.$el.width() - _this.imageDimensions.width) * _this.positioning.y, (_this.$el.outerHeight() - _this.imageDimensions.height) * _this.positioning.x),
				'max-width': 'none'
			}).data('resrc-width', _this.imageDimensions.width);

			_this.$img.addClass('ci--sized');

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
	new CoverImage(jQuery(el));
});