(function(window, $) {
	'use strict';

	var CoverImage = function( $el, cb ) {
	
		var _this = this;

			_this.$el = $el ? jQuery($el) : jQuery(window);
			_this.$img = _this.getElementForSizing();
			_this.disableOnMobile = _this.$el.data('cover-image-mobile') === false;
			_this.cb = cb || function() {
				//DEBUG console.log("Default callback");
			};
			_this.positioning = {
				x : 0.5,
				y : 0.5
			};

		_this.options = {
			parallax : jQuery($el).data('coverImageParallax') === ''
		};

		if ( _this.disableOnMobile && window.innerWidth < 480 ) {
			return;
		}

		_this.elementDimensions = {
			height : _this.$el.outerHeight(),
			width  : _this.$el.outerWidth()
		};

		_this.imageWidth = _this.$img.attr('width') || _this.$img.width();
		_this.imageHeight = _this.$img.attr('height') || _this.$img.height();

		_this.$el.css({
			'overflow' : 'hidden',
			'position' : 'relative'
		});

		if (!_this.$img.length) {
			// TODO: Implement load
			setTimeout( function() { new CoverImage( _this.$el ); }, 1000);
		} else {
			_this.resizeImage();
		}

		$(window).on('resize', function() {
			_this.resizeImage();
		})
		
		$(window).on('ci.resize', function() {
			_this.resizeImage();
		})

		setInterval(function() {
			_this.resizeImage();
		}, 1000 );

		if (_this.options.parallax) {
			_this.draw();
		}
	};

	/**
	 * Parallax FX
	 * 
	 */
	CoverImage.prototype.draw = function() {
		var _this = this,
			friction = 0.5,
			imageOffsetX = document.body.scrollTop * friction,
			imageOffsetY = document.body.scrollTop * friction,
			maximumMovementY = ( _this.imageDimensions.height - _this.elementDimensions.height) * _this.positioning.y,
			maximumMovementX = ( _this.imageDimensions.width - _this.elementDimensions.width) * _this.positioning.x;

		console.log('x:', maximumMovementX);

		if ( maximumMovementX > 0 ) {
			console.log(imageOffsetX , maximumMovementX)
			if (imageOffsetX < maximumMovementX ) {
				console.log('New position:', maximumMovementX - imageOffsetX);
				 _this.$img.css('transform', 'translateX(' + (maximumMovementX - imageOffsetX) + 'px)');
			}
		} else {
			if ( imageOffsetY < maximumMovementY )
				_this.$img.css('transform', 'translateY(' + (maximumMovementY - imageOffsetY) + 'px)');

		}


		window.requestAnimationFrame(function() {
			_this.draw();
		});
	};

	CoverImage.prototype.getElementForSizing = function() {
		var _this = this,
			selector = _this.$el.data('coverImageEl');

		if ( selector )  {
			console.log("Element selector Present", _this.$el.find( selector ) );

			return _this.$el.find( selector ) ? _this.$el.find( selector ) : _this.$el.find('img');
		}

		return _this.$el.find('img');
	};

	CoverImage.prototype.resizeImage = function() {
		var _this = this,
			dimensions = _this.coverDimensions( _this.imageWidth, _this.imageHeight, _this.$el.width(), _this.$el.outerHeight() );

		_this.imageDimensions = dimensions;

		_this.$img.attr({
			'width'  : dimensions.width,
			'height' : dimensions.height
		}).css({
			'position': 'absolute',
			'width': dimensions.width,
			'height': dimensions.height,
			'top': ( _this.$el.outerHeight() - dimensions.height) * _this.positioning.x,
			'left': ( _this.$el.width() - dimensions.width) * _this.positioning.y,
			'max-width': 'none',
		}).data('resrc-width', dimensions.width).addClass('ci--sized');

		_this.cb();
	};

	CoverImage.prototype.coverDimensions = function ( child_w, child_h, container_w, container_h ) {
		var scale_factor = this.max( container_w / child_w, container_h / child_h );

		return {
			width: Math.ceil(child_w * scale_factor),
			height: Math.ceil(child_h * scale_factor)
		};
	};

	CoverImage.prototype.containDimensions = function ( child_w, child_h, container_w, container_h ) {
		var scale_factor = this.min( container_w / child_w, container_h / child_h );

		return {
			width: child_w * scale_factor,
			height: child_h * scale_factor
		};
	};

	CoverImage.prototype.min = function( a, b ) {
		return a > b ? b : a;
	};

	CoverImage.prototype.max = function( a, b) {
		return a > b ? a : b;
	};

	jQuery('[data-cover-image]').each(function() {
		 new CoverImage( jQuery(this) );
	});


}(window, jQuery));
