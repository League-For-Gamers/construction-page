(function($){
	"use strict";

	$('body').prepend('<div class="cloned-images-wrapper" style="position: absolute; top:0; left:0; width: 0; height: 0; overflow: hidden;"></div>');
	$('.main-body-wrap-measures').find('.main-parallax-wrap').each(function(){
		var clonedImage = $(this).find('.parall-bg-image img').clone();
		$('.cloned-images-wrapper').prepend(clonedImage);
	});

	var supportsTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints,
		winWid, winHei, horizontal, vertical, mySwiper, singleSectionWidth, noOfSlides, noOfSlidesInit;
	var testimonialAuthorTO, reinitSwiperTO, swiperMesauresSetTO, swiperInitTO;
	var allowance = false;
	var parallaxOverlayIndexOffsetArray = [0];
	var parallaxOverlayIndexOffset = 0;

	$(document).ready(function(){
		winWid = $(window).innerWidth();
		winHei = $(window).innerHeight();
		$('.main-body-wrap-measures').css({'width' : winWid});
		counterInit();
		youTubePlayerDimensions();
		testimonialAuthor();
	});

	$(window).on('resize orientationchange', function(){
		winWid = $(window).innerWidth();
		winHei = $(window).innerHeight();
		resetParallaxMeasures();
		settingParallaxInitials();
		mainSlideSet();
		testimonialAuthorTO = setTimeout(function(){
			var windowWidth = $(window).innerWidth(), nameWrap = 0, textWrap = 0;
			if(windowWidth > 991){
				$('.swiper-slide').each(function(){
					var elemHeight = $(this).find('.slide-content').outerHeight();
					if(textWrap < elemHeight){textWrap = elemHeight;}
				});

				$('.testimonial-author').each(function(){
					var elemHeight = $(this).find('.author-inner-wrap').outerHeight();
					if(nameWrap < elemHeight){nameWrap = elemHeight;}
				});

				if(nameWrap > textWrap){
					$('.swiper-container, .swiper-wrapper, .swiper-slide, .testimonial-author').css({'height' : nameWrap});
				}
				else{
					$('.swiper-container, .swiper-wrapper, .swiper-slide, .testimonial-author').css({'height' : textWrap});
				}
			}
			else{
				$('.testimonial-author').each(function(){
					var elemHeight = $(this).find('.author-inner-wrap').outerHeight();
					if(nameWrap < elemHeight){nameWrap = elemHeight;}
				});
				$('.testimonial-author').parent().css({height : nameWrap});

				$('.swiper-slide').each(function(){
					var elemHeight = $(this).find('.slide-content').outerHeight();
					if(textWrap < elemHeight){textWrap = elemHeight;}
					$(this).css({'height' : textWrap});
				});
				$('.swiper-container, .swiper-wrapper').css({'height' : textWrap});
			}
			clearTimeout(testimonialAuthorTO);
		},100);
		reinitSwiperTO = setTimeout(function(){
			if(initSwiper === true){
				mySwiper.resizeFix();
			}
			clearTimeout(reinitSwiperTO);
		},200);
	});

	$('.main-content-wrapper').scroll(function(){
		if($(this).scrollTop() > 0){
			$('.section-wrapper.active').find('a.logo').removeClass('invisible');
			$('.logo-overlay-static').addClass('invisible');
		}
		else{
			$('.section-wrapper.active').find('a.logo').addClass('invisible');
			$('.logo-overlay-static').removeClass('invisible');
		}
	});
	
	var parallaxDataObject = {};

	$(document).on('mousemove', 'body' ,function(e){
		horizontal = winWid/2 - pointerEventToXY(e).x;
		vertical =  winHei/2 - pointerEventToXY(e).y;
		if(allowance){parallaxMovement();}
	});

	$(document).on('keydown', function(e){
		if(e.keyCode === 37) {
			$(this).find('.page-nav-wrap a.left-nav-arrow').trigger('click');
		}
		if(e.keyCode === 39){
			$(this).find('.page-nav-wrap a.right-nav-arrow').trigger('click');
		}
	});

	$(document).on('click', '.page-nav-wrap a', function(e){
		e.preventDefault();
		$('.section-wrapper.active .main-content-wrapper').animate({'scrollTop' : 0},150);
		var currentPos = parseInt($('.main-body-inner-wrap').css('margin-left'));
		var $this = $(this);
		if(!$('.main-body-inner-wrap').is(':animated')){
			var sectionInd;
			if($(this).hasClass('left-nav-arrow')){
				$('.main-body-inner-wrap:first').stop(true).animate({marginLeft : currentPos+singleSectionWidth},500,function(){
					if(currentPos >= -singleSectionWidth){
						$(this).css({'margin-left' : -singleSectionWidth*noOfSlidesInit});
					}
					sectionInd = Math.abs(parseInt($(this).css('margin-left'))/singleSectionWidth);
					parallaxOverlayIndexOffset = parallaxOverlayIndexOffsetArray[sectionInd];
					var currentSection = '.section' + sectionInd;
					var prevPage = $(this).find(currentSection).prev().attr('data-title');
					var nextPage = $(this).find(currentSection).next().attr('data-title');
					$this.find('span').html(prevPage);
					$('a.right-nav-arrow span').html(nextPage);
					var selector = '.section' + sectionInd;
					$('.section-wrapper.active').removeClass('active');
					$('.main-body-inner-wrap').find(selector).addClass('active');
					if(sectionInd === 1){
						$('.parallax-filter-dark').removeClass('darkened');
					}
					else{
						$('.parallax-filter-dark').addClass('darkened');
					}
					aboutPageFading();
				});
			}
			if ($(this).hasClass('right-nav-arrow')){
				$('.main-body-inner-wrap:first').stop(true).animate({marginLeft : currentPos-singleSectionWidth},500,function(){
					if(currentPos <= -singleSectionWidth*noOfSlidesInit){
						$(this).css({'margin-left' : -singleSectionWidth});
					}
					sectionInd = Math.abs(parseInt($(this).css('margin-left'))/singleSectionWidth);
					parallaxOverlayIndexOffset = parallaxOverlayIndexOffsetArray[sectionInd];
					var currentSection = '.section' + sectionInd;
					var prevPage = $(this).find(currentSection).prev().attr('data-title');
					var nextPage = $(this).find(currentSection).next().attr('data-title');
					$this.find('span').html(nextPage);
					$('a.left-nav-arrow span').html(prevPage);
					var selector = '.section' + sectionInd;
					$('.section-wrapper.active').removeClass('active');
					$('.main-body-inner-wrap').find(selector).addClass('active');
					if(sectionInd === 1){
						$('.parallax-filter-dark').removeClass('darkened');
					}
					else{
						$('.parallax-filter-dark').addClass('darkened');
					}
					aboutPageFading();
				});
			}
		}
	});

	function pointerEventToXY(e) {
		var out = {x:0, y:0};
		if(e.type == 'touchstart' || e.type == 'touchmove' || e.type == 'touchend' || e.type == 'touchcancel'){
			var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
			out.x = touch.pageX;
			out.y = touch.pageY;
		} else if (e.type == 'mousedown' || e.type == 'mouseup' || e.type == 'mousemove' || e.type == 'mouseover'|| e.type=='mouseout' || e.type=='mouseenter' || e.type=='mouseleave') {
			out.x = e.pageX;
			out.y = e.pageY;
		} else if ( e.type == 'MSPointerDown' || e.type == 'MSPointerMove' || e.type == 'MSPointerUp') { 
			var touch = e.originalEvent; 
			out.x = touch.pageX; 
			out.y = touch.pageY;
		}
		return out;
	}

	function resetParallaxMeasures(){
		$('.main-body-wrap').css({'height' : winHei, 'width' :winWid});
		var calc = 0;
		winWid = $(window).innerWidth();
		$('.section-wrapper').each(function(ind){
			$(this).data({'index' : ind});
			$(this).css({'height' : winHei, 'width' : winWid});
			if(ind >0) {parallaxOverlayIndexOffsetArray[ind] = parallaxOverlayIndexOffsetArray[ind-1] + calc;}
			calc = $(this).find('.parallax-overlay').length;
		});
		parallaxOverlayIndexOffset = parallaxOverlayIndexOffsetArray[1];
		$('.main-parallax-wrap').each(function(){
			$(this).css({'height' : winHei, 'width' : winWid});
		});
		$('.main-content-wrapper').each(function(){
			$(this).css({'height' : winHei});
		});
		var defaultRatio = 0.5625;
		var scrRatio = 0;
		$('.main-parallax-wrap').each(function(){
			var imgHeight = $(window).innerHeight();
			var imgWidth = $(window).innerWidth();
			scrRatio = imgHeight / imgWidth;
			if(defaultRatio < scrRatio){
				$(this).find('.main-bg').css({'height' : '100%', 'width' : 'auto'});
				$(this).find('.parallax-overlay').each(function(){
					$(this).css({'height' : '100%', 'width' : 'auto'});
				});
			}
			else{
				$(this).find('.main-bg').css({'height' : 'auto', 'width' : '100%'});
				$(this).find('.parallax-overlay').each(function(){
					$(this).css({'height' : 'auto', 'width' : '100%'});
				});
			}
		});
	}

	function settingParallaxInitials(){
		if(supportsTouch === true){
			$('body').addClass('touch-device');
		}
		$('.parallax-overlay').each(function(ind){
			var zIndex = $(this).attr('data-zindex');
			var verticalOffset = $(this).attr('data-offsetV') + 'px';
			var horizontalOffset = $(this).attr('data-offsetH') + 'px';
			parallaxDataObject[ind] = {};
			parallaxDataObject[ind].movementH = $(this).attr('data-movementH');
			parallaxDataObject[ind].movementV = $(this).attr('data-movementV');
			parallaxDataObject[ind].leftInitial = - ($(this).innerWidth() - winWid)/2;
			parallaxDataObject[ind].topInitial = - ($(this).innerHeight() - winHei)/2;
			$(this).css({'left' : parallaxDataObject[ind].leftInitial, 'top' : parallaxDataObject[ind].topInitial, 'z-index' : zIndex});
			$(this).css({'margin-top' : verticalOffset, 'margin-left' : horizontalOffset});
		});
	}

	function parallaxMovement(){
		$('.main-body-wrap > .main-body-wrap-measures > .main-parallax-wrap .parallax-overlay').each(function(ind){
			var objIndex = parallaxOverlayIndexOffset + ind;
			parallaxDataObject[objIndex].leftMove = parallaxDataObject[objIndex].leftInitial - (horizontal * parallaxDataObject[objIndex].movementH);
			parallaxDataObject[objIndex].topMove = parallaxDataObject[objIndex].topInitial - (vertical * parallaxDataObject[objIndex].movementV);
			$(this).css({'left' : parallaxDataObject[objIndex].leftMove, 'top' : parallaxDataObject[objIndex].topMove});
		});
		$('.section-wrapper.active:first .parallax-overlay').each(function(ind){
			var objIndex = parallaxOverlayIndexOffset + ind;
			parallaxDataObject[objIndex].leftMove = parallaxDataObject[objIndex].leftInitial - (horizontal * parallaxDataObject[objIndex].movementH);
			parallaxDataObject[objIndex].topMove = parallaxDataObject[objIndex].topInitial - (vertical * parallaxDataObject[objIndex].movementV);
			$(this).css({'left' : parallaxDataObject[objIndex].leftMove, 'top' : parallaxDataObject[objIndex].topMove});
		});
	}

	function mainSlideSet(){
		noOfSlides = $('.main-body-inner-wrap').children('.section-wrapper').length;
		singleSectionWidth = $('.section-wrapper').outerWidth();
		$('.main-body-inner-wrap').css({'width' : singleSectionWidth*noOfSlides, 'margin-left' : - singleSectionWidth});
	}

	function cloningElements(){
		noOfSlidesInit = $('.main-body-inner-wrap').children('.section-wrapper').length;
		var firstElement = $('.main-body-inner-wrap .section-wrapper:first-child').clone();
		var lastElement = $('.main-body-inner-wrap .section-wrapper:last-child').clone();
		$('.main-body-inner-wrap').append(firstElement).prepend(lastElement);
		$('.main-body-inner-wrap').find('.section-wrapper').each(function(){
			var classNaming = 'section' + $(this).index();
			$(this).addClass(classNaming);
		});
		$('.main-body-inner-wrap').children('.section-wrapper').first().next().addClass('active');
		if($('.main-body-inner-wrap .section-wrapper:last-child').find('#map-canvas').length > 0){
			$('.main-body-inner-wrap .section-wrapper:last-child').find('#map-canvas').attr('id','map-canvas-cloned');
		}
		if($('.main-body-inner-wrap .section-wrapper:first-child').find('#map-canvas').length > 0){
			$('.main-body-inner-wrap .section-wrapper:first-child').find('#map-canvas').attr('id','map-canvas-cloned');
		}
	}

	function aboutPageFading(){
		if($('.section-wrapper.active .about-element').length > 0){
			$('.section-wrapper.active .about-element').each(function(index){
				if(!$(this).hasClass('animated')){
					var delayVal = $(this).index() * 150;
					$(this).delay(delayVal).animate({opacity : 1}, 400, function(){
						$(this).addClass('animated');
					});
				}
			});
		}
	}

	function counterInit(){
		if($('.countdown').length > 0){
			var endDate = "June 7, 2087 15:03:25";
			$('.countdown.styled').countdown({
				date: endDate,
				render: function(data) {
					var counterElements ="<div>";
						counterElements += this.leadingZeros(data.days, 3);
						counterElements += "<div class='counter-number-bg'>888</div>";
						counterElements += "<div class='counter-segment-name'>days</div>";
					counterElements += "</div>";
					counterElements += " <div class=''>:";
						counterElements += "<div class='counter-segment-name placeholder'>.</div>";
					counterElements += "</div>";
					counterElements += " <div class='leding-theme-color'>";
						counterElements += this.leadingZeros(data.hours, 2);
						counterElements += "<div class='counter-number-bg'>88</div>";
						counterElements += "<div class='counter-segment-name'>hours</div>";
					counterElements += "</div>";
					counterElements += " <div class=''>:";
						counterElements += "<div class='counter-segment-name placeholder'>.</div>";
					counterElements += "</div>";
					counterElements += " <div>";
						counterElements += this.leadingZeros(data.min, 2);
						counterElements += "<div class='counter-number-bg'>88</div>";
						counterElements += "<div class='counter-segment-name'>minutes</div>";
					counterElements += "</div>";
					counterElements += " <div class=''>:";
						counterElements += "<div class='counter-segment-name placeholder'>.</div>";
					counterElements += "</div>";
					counterElements += " <div>";
						counterElements += this.leadingZeros(data.sec, 2);
						counterElements += "<div class='counter-number-bg'>88</div>";
						counterElements += "<div class='counter-segment-name'>seconds</div>";
					counterElements += "</div>";
					$(this.el).html(counterElements);
				}
			});
		}
	}

	function youTubePlayerDimensions(){
		if($('.player').length > 0){
			var scrWid = $(window).outerWidth(), scrHei = (scrWid * 9)/16;
			$('.player').each(function(){
				$(this).css({'height' : scrHei, 'width' : scrWid});
			});
		}
	}

	function testimonialAuthor(){
		if($('.testimonial-element-wrapper .testimonial-author').length > 0){
			var firstAuthor = $('.testimonial-element-wrapper .testimonial-author').first().clone();
			var lastAuthor = $('.testimonial-element-wrapper .testimonial-author').last().clone();
			$('.testimonial-element-wrapper .testimonial-author').parent().prepend(lastAuthor).append(firstAuthor);
			$('.testimonial-element-wrapper .testimonial-author').each(function(index){
				var classNaming = 'element' + $(this).index();
				$(this).addClass(classNaming);
			});
			$('.testimonial-element-wrapper .testimonial-author.element1').addClass('author-active');
		}
	}

	var initSwiper = false;

	$('.cloned-images-wrapper').waitForImages(function(){
		winWid = $(window).innerWidth();
		winHei = $(window).innerHeight();
		allowance = true;
		cloningElements();
		resetParallaxMeasures();
		settingParallaxInitials();
		mainSlideSet();
		initSwiper = true;
		$('.page-loader-wrap').animate({opacity : 0},300,function(){
			$(this).hide();
		});
		$('.section-wrapper').css({'visibility' : 'visible'});
		if($('#player').length > 0){
			$(".player").mb_YTPlayer();
			$('img.main-bg').css({'visibility' : 'hidden'});
		}
		swiperMesauresSetTO = setTimeout(function(){
			var windowWidth = $(window).innerWidth(), nameWrap = 0, textWrap = 0;
			if(windowWidth > 991){
				$('.swiper-slide').each(function(){
					var elemHeight = $(this).find('.slide-content').outerHeight();
					if(textWrap < elemHeight){textWrap = elemHeight;}
				});

				$('.testimonial-author').each(function(){
					var elemHeight = $(this).find('.author-inner-wrap').outerHeight();
					if(nameWrap < elemHeight){nameWrap = elemHeight;}
				});

				if(nameWrap > textWrap){
					$('.swiper-container, .swiper-wrapper, .swiper-slide, .testimonial-author').css({'height' : nameWrap});
				}
				else{
					$('.swiper-container, .swiper-wrapper, .swiper-slide, .testimonial-author').css({'height' : textWrap});
				}
			}
			else{
				$('.testimonial-author').each(function(){
					var elemHeight = $(this).find('.author-inner-wrap').outerHeight();
					if(nameWrap < elemHeight){nameWrap = elemHeight;}
				});
				$('.testimonial-author').parent().css({height : nameWrap});

				$('.swiper-slide').each(function(){
					var elemHeight = $(this).find('.slide-content').outerHeight();
					if(textWrap < elemHeight){textWrap = elemHeight;}
					$(this).css({'height' : textWrap});
				});
				$('.swiper-container, .swiper-wrapper').css({'height' : textWrap});
			}
			clearTimeout(swiperMesauresSetTO);
		},100);
		swiperInitTO = setTimeout(function(){
			mySwiper = new Swiper('.swiper-container',{
				pagination: '.pagination',
				loop:true,
				grabCursor: true,
				paginationClickable: true,
				resizeReInit : true,
				speed : 300,
				onSlideChangeStart : function(){
					var slideIndexed;
					$(document).find('.swiper-slide').each(function(index){
						if($(this).hasClass('swiper-slide-active')){
							slideIndexed = 'element' + $(this).index();
						}
					});
					$(document).find('.testimonial-author').each(function(){
						if($(this).hasClass(slideIndexed)){
							$(this).addClass('author-active');
						}
						else{
							$(this).removeClass('author-active');
						}
					});
				}
			});
			initSwiper = true;
			clearTimeout(swiperInitTO);
		},200);
		init();
		$('img.parallax-overlay').lazyload({
			effect : "fadeIn",
			skip_invisible : false,
			event : "scroll",
			threshold : 100000
		});
	});

	function init() {
		var mapOptions = {
			center: new google.maps.LatLng(41.895668,12.4806651),
			zoom: 16,
			scrollwheel: false,
			draggable : true,
			overviewMapControl: true,
			overviewMapControlOptions: { opened: false },
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			styles: [{    featureType: 'all',  stylers: [{saturation: 25}, {lightness :0}, {weight : 0.1}, {hue: '#cb4b36'}, {invert_lightness : true}, {gamma : 1}]} ]
		}
		var mapElement = document.getElementById('map-canvas');
		var map = new google.maps.Map(mapElement, mapOptions);
		var locations = [
			['New York', 41.895668,12.4806651]
		];
		for (var i = 0; i < locations.length; i++) {
			var marker = new google.maps.Marker({
				icon: 'http://codemancystudio.com/dev/vlada/lfg/images/global/pin.png',
				position: new google.maps.LatLng(locations[i][1], locations[i][2]),
				map: map
			});
		}
	}



	$(document).ready(function(){
		$('.panel-collapse.in').closest('.panel').find('.panel-heading').addClass('focused');
	});

	$(document).on('click', '#news-accordion .panel-title > a', function () {
		$(this).closest('#news-accordion').find('.panel-heading.focused').removeClass('focused');
		$(this).closest('.panel-heading').addClass('focused');
	});

	$(document).on('click', 'a.link-to-close', function(e){
		e.preventDefault();
		$(this).closest('.panel').find('.panel-collapse').collapse('hide');
		$(this).closest('.panel').find('.panel-heading').removeClass('focused');
	});


})(jQuery);