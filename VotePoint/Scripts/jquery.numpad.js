/*
 * jQuery.NumPad
 *
 * Copyright (c) 2015 Andrej Kabachnik
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Project home:
 * https://github.com/kabachello/jQuery.NumPad
 *
 * Version: 1.0
 *
 */
(function ($) {
	$.fn.numpad = function (options) {

		options = $.extend({}, $.fn.numpad.defaults, options);
		var id = 'nmpd' + $('.nmpd-wrapper').length + 1;


		return this.each(function () {
			$(this).attr("readonly", true);
			var target = options.target ? options.target : $(this);
			$(this).bind(options.openOnEvent, function () {
				nmpd.open(target);
			});

			if ($('#' + id).length == 0) {
				var nmpd = $('<div id="' + id + '"></div>').addClass('nmpd-wrapper');
				var table = $(options.gridTpl).addClass('nmpd-grid');
				var display = $(options.displayTpl).addClass('nmpd-display').attr('id', 'nmpd-display');
				$(display).keydown(function (e) {
					//ENTER
					if (e.keyCode == 13) {
						e.preventDefault();
						e.stopPropagation();
						nmpd.close(target);
					}
					//ESC
					if (e.keyCode == 27) {
						e.preventDefault();
						e.stopPropagation();
						if ($(this).val() == '') {
							nmpd.close(false);
						}
						$(this).val('');
					}
				});
				nmpd.display = display;
				nmpd.grid = table;
				table.append($(options.rowTpl).append($(options.displayCellTpl).append(display).append($('<input type="hidden" class="dirty" value="0"></input>'))));
				table.append(
					$(options.rowTpl)
						.append($(options.cellTpl).append($(options.buttonNumberTpl).html(7).addClass('numero')))
						.append($(options.cellTpl).append($(options.buttonNumberTpl).html(8).addClass('numero')))
						.append($(options.cellTpl).append($(options.buttonNumberTpl).html(9).addClass('numero')))
						.append($(options.cellTpl).append($(options.buttonFunctionTpl).html(options.textDelete).addClass('del').click(function () {
							display.val(display.val().substring(0, display.val().length - 1));
							nmpd.focusIfNeed(false);
						})))
					).append(
					$(options.rowTpl)
						.append($(options.cellTpl).append($(options.buttonNumberTpl).html(4).addClass('numero')))
						.append($(options.cellTpl).append($(options.buttonNumberTpl).html(5).addClass('numero')))
						.append($(options.cellTpl).append($(options.buttonNumberTpl).html(6).addClass('numero')))
						.append($(options.cellTpl).append($(options.buttonFunctionTpl).html(options.textClear).addClass('clear').click(function () {
							display.val('');
							nmpd.focusIfNeed(false);
						})))
					).append(
					$(options.rowTpl)
						.append($(options.cellTpl).append($(options.buttonNumberTpl).html(1).addClass('numero')))
						.append($(options.cellTpl).append($(options.buttonNumberTpl).html(2).addClass('numero')))
						.append($(options.cellTpl).append($(options.buttonNumberTpl).html(3).addClass('numero')))
						.append($(options.cellTpl).append($(options.buttonFunctionTpl).html(options.textCancel).addClass('cancel').click(function () {
							nmpd.close(false);
						})))
					).append(
					$(options.rowTpl)
						.append($(options.cellTpl).append($(options.buttonFunctionTpl).html('-').addClass('neg').click(function () {
							if (!isNaN(display.val()) && display.val().length > 0) {
								if (parseInt(display.val()) > 0) {
									display.val(parseInt(display.val()) - 1);
								}
							}
							nmpd.focusIfNeed(false);
						})))
						.append($(options.cellTpl).append($(options.buttonNumberTpl).html(0).addClass('numero')))
						.append($(options.cellTpl).append($(options.buttonFunctionTpl).html('+').addClass('pos').click(function () {
							if (!isNaN(display.val())) {
								if (display.val().length == 0) {
									display.val(1);
								} else {
									display.val(parseInt(display.val()) + 1);
								}
							}
							nmpd.focusIfNeed(false);
						})))
						.append($(options.cellTpl).append($(options.buttonFunctionTpl).html(options.textDone).addClass('done')))
					);
				nmpd.append($(options.backgroundTpl).addClass('nmpd-overlay').attr('id', 'nmpd-overlay').click(function () { nmpd.close(false); }));
				nmpd.append(table);
				if (options.onKeypadCreate) {
					nmpd.on('numpad.create', options.onKeypadCreate);
				}
				(options.appendKeypadTo ? options.appendKeypadTo : $(document.body)).append(nmpd);

				$('#' + id + ' .numero').bind('click', function () {
					var val;
					if ($('#' + id + ' .dirty').val() == '0') {
						val = $(this).text();
					} else {
						val = nmpd.getValue() ? nmpd.getValue().toString() + $(this).text() : $(this).text();
					}
					nmpd.setValue(val);
				});

				nmpd.trigger('numpad.create');
			} else {
				nmpd = $('#' + id);
				nmpd.display = $('#' + id + ' input.nmpd-display');
			}

			/**
			* Gets the current value displayed in the numpad
			* @return string | number
			*/
			nmpd.getValue = function () {
				return isNaN(nmpd.display.val()) ? 0 : nmpd.display.val();
			};

			/**
			* Sets the display value of the numpad
			* @param string value
			* @return jQuery object nmpd
			*/
			nmpd.setValue = function (value) {
				if (nmpd.display.attr('maxLength') < value.toString().length) value = value.toString().substr(0, nmpd.display.attr('maxLength'));
				nmpd.display.val(value);
				nmpd.focusIfNeed(false);
				nmpd.find('.dirty').val('1');
				return nmpd;
			};

			nmpd.focusIfNeed = function (shouldSelect) {
				if (typeof window.mobilecheck == 'function' && !window.mobilecheck()) {
					nmpd.display.focus();
					if (shouldSelect) {
						nmpd.display.select();
					}
				}
			};

			nmpd.close = function (target) {
				if (target) {
					if (target.prop("tagName") == 'INPUT') {
						target.val(nmpd.display.val());
					} else {
						target.html(nmpd.display.val());
					}
				}

				nmpd.hide();
				$(target).trigger("change");
				return nmpd;
			};

			nmpd.open = function (target, initialValue) {
				if (initialValue) {
					nmpd.display.val(initialValue);
				} else {
					if (target.prop("tagName") == 'INPUT') {
						nmpd.display.val(target.val());
						nmpd.display.attr('maxLength', target.attr('maxLength'));
					} else {
						nmpd.display.val(parseFloat(target.text()));
					}
				}
				$('#' + id + ' .dirty').val(0);
				nmpd.show();
				$('#' + id + ' .done').off('click');
				$('#' + id + ' .done').one('click', function () { nmpd.close(target); });

				nmpd.focusIfNeed(true)
				
				return nmpd;
			};
		});
	};

	$.fn.numpad.defaults = {
		target: false,
		openOnEvent: 'click',
		backgroundTpl: '<div></div>',
		gridTpl: '<table></table>',
		displayTpl: '<input type="number" />',
		displayCellTpl: '<td colspan="4"></td>',
		rowTpl: '<tr></tr>',
		cellTpl: '<td></td>',
		buttonNumberTpl: '<button></button>',
		buttonFunctionTpl: '<button></button>',
		gridTableClass: '',
		textDone: 'Done',
		textDelete: 'Del',
		textClear: 'Clear',
		textCancel: 'Cancel',
		appendKeypadTo: false,
		position: 'fixed',
		positionX: 'center',
		positionY: 'middle',
		onKeypadCreate: false
	};
})(jQuery);