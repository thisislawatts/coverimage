const elementResizeDetectorMaker = require('element-resize-detector');

class CoverImage {
	constructor(el, cb) {
		const _this = this;

		_this.$el = el ? el : window;
		_this.$img = _this.getElementForSizing();
		_this.disableOnMobile = _this.$el.dataset['cover-image-mobile'] === 'false';
		_this.cb = cb || (() => {
			//DEBUG console.log("Default callback");
		});

		_this.positioning = {
			x : 0.5,
			y : 0.5
		};
		_this.options = {
			parallax : _this.$el.dataset.coverImageParallax === 'true'
		};

		if (!_this.$img) {
			console.log('Error:', 'no image found', _this.$img );
			return;
		}

		_this.imageWidth = _this.$img.width;
		_this.imageHeight = _this.$img.height;

		// If the image doesn't have harcoded width|height
		// attributes then load the image to calculate
		// the dimensions
		if (!_this.imageWidth || !_this.imageHeight) {
			console.log('No dimensions found. Generating image:', _this.$img.attr('src'))
			_this.img = new Image();
			_this.img.src = _this.$img.attr('src');

			_this.imageWidth = _this.img.width;
			_this.imageHeight = _this.img.height;
		}

		if ( _this.disableOnMobile && window.innerWidth < 480 ) {
			return;
		}

		_this.elementDimensions = {
			height : _this.$el.clientHeight,
			width  : _this.$el.clientWidth
		};

		_this.$el.style = `
			overflow : hidden;
			position : relative;
		`;

		if (!_this.$img) {
			// TODO: Implement load
			setTimeout( () => {
				new CoverImage( _this.$el );
			}, 1000);

		} else {
			_this.resizeImage();
		}

		_this.$img.addEventListener('load', () => {
			_this.resizeImage();
		}, false);

		_this.$el.addEventListener('transitionend', () => {
			_this.resizeImage();
		}, false)

		var erd = elementResizeDetectorMaker({
			strategy: 'scroll'
		});

		erd.listenTo(_this.$el, () => {
			_this.resizeImage();
		})

		_this.$el.addEventListener('animationend', () => {
			_this.resizeImage();
		}, false)

		window.addEventListener('resize', () => {
			_this.resizeImage();
		}, true);

		window.addEventListener('ci.resize', () => {
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
	draw() {
		const _this = this;
		const friction = 0.5;
		const imageOffsetX = document.body.scrollTop * friction;
		const imageOffsetY = document.body.scrollTop * friction;
		const maximumMovementY = ( _this.imageDimensions.height - _this.elementDimensions.height) * _this.positioning.y;
		const maximumMovementX = ( _this.imageDimensions.width - _this.elementDimensions.width) * _this.positioning.x;

		if ( maximumMovementX > 0 ) {
			if (imageOffsetX < maximumMovementX ) {
				// console.log('New position:', maximumMovementX - imageOffsetX);
				_this.$img.css({
					'transform': `translateX(${maximumMovementX - imageOffsetX}px)`
				});
			}

		} else {
			if ( imageOffsetY < maximumMovementY ) {
				_this.$img.css('transform', `translateY(${maximumMovementY - imageOffsetY}px)`);
			}
		}

		window.requestAnimationFrame(() => {
			_this.draw();
		});
	}

	/**
	 *
	 * @return DOM Element
	 */
	getElementForSizing() {
		let _this = this;
		let selector = _this.$el.dataset['coverImageEl'];

		if ( selector )  {

			console.log( 'Element selector Present', _this.$el.find( selector ) );

			return _this.$el.find( selector ) ? _this.$el.find( selector ) : _this.$el.find('img');
		}

		return _this.$el.querySelector('img');
	}

	resizeImage() {
		const _this = this;
		const elementWidth = _this.$el.clientWidth;
		const elementHeight = _this.$el.clientHeight;
		const dimensions = _this.coverDimensions( _this.imageWidth, _this.imageHeight, elementWidth, elementHeight );

		_this.imageDimensions = dimensions;

		if ( isNaN( dimensions.width ) ) {
			console.log('Failed to calculate image sizes.');
		}

		_this.setImageSize();
	}

	setImageSize() {
		const _this = this;

		_this.$img.width = _this.imageDimensions.width;
		_this.$img.height = _this.imageDimensions.height;

		let transform = _this.getTransform(
				( _this.$el.clientWidth - _this.imageDimensions.width) * _this.positioning.y,
				( _this.$el.clientHeight - _this.imageDimensions.height) * _this.positioning.x
			);

		_this.$img.style = `
			position: absolute;
			width: ${_this.imageDimensions.width};
			height: ${_this.imageDimensions.height};
			transform: ${transform};
			max-width: none;
		`;

		_this.$img.classList.add('ci--sized');
		_this.cb();
	}

	getTransform(x, y) {
		return `translate3d(${x}px,${y}px,0)`;
	}

	coverDimensions(child_w, child_h, container_w, container_h) {
		const scale_factor = this.max( container_w / child_w, container_h / child_h );

		return {
			width: Math.ceil(child_w * scale_factor),
			height: Math.ceil(child_h * scale_factor)
		};
	}

	containDimensions(child_w, child_h, container_w, container_h) {
		const scale_factor = this.min( container_w / child_w, container_h / child_h );

		return {
			width: child_w * scale_factor,
			height: child_h * scale_factor
		};
	}

	min(a, b) {
		return a > b ? b : a;
	}

	max(a, b) {
		return a > b ? a : b;
	}
}

const elems = document.body.querySelectorAll('[data-cover-image]');

elems.forEach(el => {
	new CoverImage( el );
});