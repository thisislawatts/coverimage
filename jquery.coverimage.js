(function(window, $) {
	'use strict';

	var CoverImage = function( $el, cb ) {
	
		var _this = this;

			_this.$img = $el.find('img');
			_this.$el = $el ? jQuery($el) : jQuery(window);
			_this.disableOnMobile = _this.$el.data('cover-image-mobile') === false;
			_this.cb = cb || function() {
				//DEBUG console.log("Default callback");
			};

		if ( _this.disableOnMobile && window.innerWidth < 480 ) {
			return;
		}

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
		
		setInterval(function() {
			_this.resizeImage();
		}, 1000 );
	};

	CoverImage.prototype.resizeImage = function() {
		var _this = this,
			dimensions = _this.coverDimensions( _this.imageWidth, _this.imageHeight, _this.$el.width(), _this.$el.outerHeight() );

		_this.$img.attr({
			'width'  : dimensions.width,
			'height' : dimensions.height
		}).css({
			'position': 'absolute',
			'width': dimensions.width + 1,
			'height': dimensions.height,
			'top': ( _this.$el.outerHeight() - dimensions.height) * 0.5,
			'left': ( _this.$el.width() - dimensions.width) * 0.5,
			'max-width': 'none',
			'z-index': -1
		}).data('resrc-width', dimensions.width);

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