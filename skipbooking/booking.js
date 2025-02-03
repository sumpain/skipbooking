jQuery(document).ready(function ($) {

    // console.log('ready');

	// push here unavailable Dates (i.e. Easter 2018 and Easter Monday 02/04/18)
	var unavailableDates = ["2018-04-01", "2018-04-02", "2018-05-26", "2018-05-27", "2018-05-28"];

    if (!$('#ch-booking-form').length) return;

    if ($('#form-sent').val() == 'yes') window.location.reload();

    var currentDate = new Date();
    var currentYear = currentDate.getFullYear();
    var newYear = currentDate.getFullYear() + 1;
    //var booked_array = [currentYear+"-12-22", currentYear+"-12-23", currentYear+"-12-24", currentYear+"-12-25", currentYear+"-12-26", currentYear+"-12-27", currentYear+"-12-28", currentYear+"-12-29", currentYear+"-12-30", currentYear+"-12-31", newYear+"-01-01", newYear+"-01-02",currentYear+"-05-31",currentYear+"-08-30"];
	// block dates 22/12/18 to 01/01/19 - Eli
	var booked_array = [currentYear+"-12-21", currentYear+"-12-22", currentYear+"-12-23", currentYear+"-12-24", currentYear+"-12-25", currentYear+"-12-26", currentYear+"-12-27", currentYear+"-12-28", currentYear+"-12-29", currentYear+"-12-30", currentYear+"-12-31", newYear+"-01-01", newYear+"-01-02",currentYear+"-05-31",currentYear+"-08-30"];
	// sunday bug fix-----
    var datetoday = new Date();
    var datetwodays = new Date(datetoday.getFullYear(), datetoday.getMonth(), datetoday.getDate() + 2);
    var frommindate = (!datetwodays.getDay()) ? '+3d' : '+2d'; // add 1day if sunday
	// -----
    var datePickerFrom = $('#hire-period-input-from').datepicker({
        minDate: frommindate,
        defaultDate: frommindate,
        // minDate: '+6d',
        // defaultDate: '+6d',
        dateFormat: 'dd-mm-yy',
        beforeShowDay: function(date) {
            var string = jQuery.datepicker.formatDate('yy-mm-dd', date);
            if (contains(booked_array,string) || unavailableDates.indexOf(string) > -1) {
                // debugger;
                return [false, '']
            } else {
                var day = date.getDay();
                return [(day != 0), ''];
            }
        },
    }).datepicker('setDate', new Date()).on('change', function () {
        datePickerTo.datepicker('option', 'minDate', datePickerFrom.datepicker('getDate').addDays(1)); //.addDays(7)
        datePickerTo.datepicker('option', 'defaultDate', datePickerFrom.datepicker('getDate').addDays(1)); //.addDays(7)
    })
	// Add note if orders are made before christmas - Eli
	.on('change', function () {
		var selDateString = $(this).val().split('-');
		var selDate = new Date( selDateString[1] +'/'+ selDateString[0] +'/'+ selDateString[2] );
		var availDate = new Date('01/01/2019');
		if( selDate.getTime() <= availDate.getTime() ){
			$('.december-date-note').html('</br>Note: Please note that collections before Christmas must be booked for 20/12/2018 or before.');
		}
    });

    // sunday bug fix-----
    var datethreedays = new Date(datetoday.getFullYear(), datetoday.getMonth(), datetoday.getDate() + 3);
    var tomindate = (!datetwodays.getDay()) ? '+4d' : '+3d'; // add 1day if sunday
	// -----
    var datePickerTo = $('#hire-period-input-until').datepicker({
        minDate: tomindate,//addDate(new Date(), 7),
        // maxDate: '+2w',//addDate(new Date(), 7),
        defaultDate: tomindate,
        // minDate: '+1w',
        // defaultDate: '+1w',
        dateFormat: 'dd-mm-yy',
        beforeShowDay: function(date) {
            var string = jQuery.datepicker.formatDate('yy-mm-dd', date);
            if (contains(booked_array,string) || unavailableDates.indexOf(string) > -1 || day == 0) {
                debugger;
                return [false, '']
            } else {
                var day = date.getDay();
                return [(day != 0), ''];
            }
        }

    }).datepicker('setDate', '2d')
    // .on('change', function () {
    //     datePickerFrom.datepicker('option', 'maxDate', $(this).val());
    // });

    calculatePrice($);

    checkSkips($);

    $('.chb-type-tabs').find('span').on('click', function (e) {
        var tab = $(this);
        tab.addClass('chb-tab-selected');
        tab.siblings('span').removeClass('chb-tab-selected');
        $('#skip-type-select').val(tab.data('value')).trigger('change');
    });

    $('#postcode-select').on('change', function (e) {
        checkSkips($);
        checkParkingPermit($);
    });

    $('input[type=radio][name=waste-type]').on('change', function (e) {
        checkSkips($);
    });

    $('input[type=radio][name=land-type]').on('change', function (e) {
        showOtherOptions($);
    });

    $('input[type=radio][name=land-type]').on('change', function (e) {
        checkParkingPermit($);
        var council = postCodes.getCouncil($('#postcode-select').val());
        var date = datePickerFrom.datepicker('getDate');
        if ($('#land-type-public').is(':checked')) {
            addedBusinessDays = addBusinessDays(date, council.noticePeriod);
            date.addDays(addedBusinessDays);
            //datePickerFrom.datepicker('option', 'minDate', date);
            //datePickerFrom.trigger('change');
            // datePickerTo.datepicker('setDate', date);
        } else {
            // date.setDate(date.getDate() - addedBusinessDays);
            // datePickerTo.datepicker('setDate', date);
            //datePickerFrom.datepicker('option', 'minDate', new Date());
            //datePickerFrom.trigger('change');
        }
    });

    $('.calendar-icon').click(function () {
        var id = '#' + $(this).data('for');
        $(id).datepicker('show');
    });

    $('#ch-booking-form').find('input, select').on('change', function (e) {
        calculatePrice($);
    });

    $('#ch-book-now').on('click', function (e) {
        e.preventDefault();
        // var noticeString = '';
        // if ($('#land-type-public').is(':checked')) noticeString = ', including ' + postCodes.getCouncil($('#postcode-select').val()).noticePeriod + ''
        var checkSize = false;
        var checkPostcode = false
        var checkCouncil = false;
        var checkdateFrom = false;
        var checkdateUntil = false;

        if(jQuery('#skip-size-select').val() != '0') {
            checkSize = true;
            jQuery('#skip-size-select').removeClass('required-field');
        } else {
            jQuery('#skip-size-select').addClass('required-field');
        }

        if(jQuery('#postcode-select').val() != 'XTAT') {
            checkPostcode = true;
            jQuery('#postcode-select').removeClass('required-field');
        } else {
            jQuery('#postcode-select').addClass('required-field');
        }

        if(jQuery('#hire-period-input-from').val() != '') {
            checkdateFrom = true;
            jQuery('#hire-period-input-from').removeClass('required-field');
        } else {
            jQuery('#hire-period-input-from').addClass('required-field');
        }

        if(jQuery('#hire-period-input-until').val() != '') {
            checkdateUntil = true;
            jQuery('#hire-period-input-until').removeClass('required-field');
        } else {
            jQuery('#hire-period-input-until').addClass('required-field');
        }

        if(jQuery('#land-type-public').is(':checked') && jQuery('#council-options').val() != '0') {
            checkCouncil = true;
            jQuery('#council-options').removeClass('required-field');
        } else {
            if(jQuery('#land-type-public').is(':checked') && jQuery('#council-options').val() == '0') {
                jQuery('#council-options').addClass('required-field');
            } else {
                if(jQuery('#land-type-public').not(':checked')) {
                    checkCouncil = true;
                    jQuery('#council-options').removeClass('required-field');
                }
            }
        }

        removedMessage('form-error');
        if(checkSize == true && checkPostcode == true && checkCouncil == true && checkdateFrom == true && checkdateUntil == true) {
            removedMessage('form-error');
            var productData = {
                purpose: $('.chb-type-tabs').find('.chb-tab-selected').html(),//.data('value'),
                size: $('#skip-size-select option:selected').text(),//.val(),
                postcode: $('#postcode-select').val(),
                period: 'From ' + $('#hire-period-input-from').val() + ' Until ' + $('#hire-period-input-until').val(),
                wasteType: $('label[for=' + $('input[name=waste-type]:checked', '#ch-booking-form').attr('id') + ']').text(),//.val(),
                landType: $('label[for=' + $('input[name=land-type]:checked', '#ch-booking-form').attr('id') + ']').text(),
                council: $('#council-options option:selected').text(),
                price: $('#quoted-price').find('span').html(),
                price1: $('#xquoted-price').find('span').html()
            };
            // console.log(productData);
            $.ajax({
                method: 'post',
                url: ajax_ch_booking_object.ajaxurl,
                data: {
                    'action': 'ch_booking_handler',
                    'product': productData
                },
                success: function (response) {
                    $('#form-sent').attr('value', 'yes');
                    // console.log(response);
                    window.location.href = response;
                },
                error: function (response) {
                    // console.log(response);
                }
            });
        } else {
            errorMessage('Please fill out the required fields.', 'form-error')
        }
    });
});

function errorMessage(text,id){
    var errorContainer = '<div class="sh-error-message" id="'+ id +'">'+ text +'</div>';
    jQuery('#ch-booking-form').append(errorContainer);
}

function removedMessage(id){
    var removeId = '#'+ id;
    jQuery(removeId).remove();
}

var addedBusinessDays = 0;
Date.prototype.addDays = function (days) {
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat;
}

function addBusinessDays(curdate, weekDaysToAdd) {
    var realDaysToAdd = 0;
    while (weekDaysToAdd > 0) {
        curdate.setDate(curdate.getDate() + 1);
        realDaysToAdd++;
        //check if current day is business day
        if (noWeekendsOrHolidays(curdate)[0]) {
            weekDaysToAdd--;
        }
    }
    return realDaysToAdd;
}

function noWeekendsOrHolidays(date) {
    var noWeekend = jQuery.datepicker.noWeekends(date);
    if (noWeekend[0]) {
        return nationalDays(date);
    } else {
        return noWeekend;
    }
}

function nationalDays(date) {
    var natDays = [
        [1, 1, 'uk'],
        [1, 2, 'uk'],
        [12, 22, 'uk'],
        [12, 23, 'uk'],
        [12, 24, 'uk'],
        [12, 25, 'uk'],
        [12, 26, 'uk'],
        [12, 27, 'uk'],
        [12, 28, 'uk'],
        [12, 29, 'uk'],
        [12, 30, 'uk'],
        [12, 31, 'uk']
    ];
    for (i = 0; i < natDays.length; i++) {
        if (date.getMonth() == natDays[i][0] - 1 && date.getDate() == natDays[i][1]) {
            return [false, natDays[i][2] + '_day'];
        }
    }
    return [true, ''];
}

function checkSkips($) {
    var skipSizes = {
        '2': '2yd',
        '4': '4yd',
        '8': '8yd',
        '10': '10yd',
        '12': '12yd',
        '14': '14yd',
        '12e': '12yd enclosed'
    }
    var skipSizesShort = {
        '2': '2yd',
        '4': '4yd',
        '8': '8yd'
//      '10': '10yd'
    }
    var additionalSkipSizes = {
//      '12': '12yd',
//      '14': '14yd',
//      '12e': '12yd enclosed'
    }
    var location = $('#postcode-select').val();
    var type = $('#waste-type-bs').is(':checked');
    var skipSizeSelector = $('#skip-size-select');
    var option;
    if (location == 'XTAT' && type) {
        for (var key in additionalSkipSizes) {
            skipSizeSelector.find('option[value="' + key + '"]').remove();
        }
    } else {
        for (var key in additionalSkipSizes) {
            option = skipSizeSelector.find('option[value="' + key + '"]');
            if (!option.length) skipSizeSelector.append($('<option value="' + key + '">' + additionalSkipSizes[key] + '</option>'));
        }
    }
    // skipSizeSelector.focus();
}

var postCodes = {
    councils: {
        wscodes: {
            codes: ['WS1', 'WS2', 'WS3', 'WS4', 'WS5', 'WS6', 'WS8', 'WS9', 'WS10', 'WS11', 'WS12'],
            price: 0,
            plasterboard: 60,
            noticePeriod: 3,
            validPeriod: 28,
            parking: {
                price: 0,
                period: 1
            }
        },
        bcodes_one: {
            codes: ['B71', 'B70', 'B69', 'B68', 'B67', 'B66', 'B65', 'B64', 'B63', 'B62', 'B43', 'B42', 'B17', 'B18', 'B20', 'B21'],
            price: 0,
            plasterboard: 60,
            noticePeriod: 3,
            validPeriod: 28,
            parking: {
                price: 0,
                period: 1
            }
        },
        bcodes_two: {
            codes: ['B1', 'B2', 'B3', 'B4', 'B5'],
            price: 0,
            plasterboard: 60,
            noticePeriod: 3,
            validPeriod: 28,
            parking: {
                price: 0,
                period: 1
            }
        },
        dycodes: {
            codes: ['DY1', 'DY2', 'DY3', 'DY4', 'DY5', 'DY6', 'DY7', 'DY8', 'DY10'],
            price: 0,
            plasterboard: 60,
            noticePeriod: 3,
            validPeriod: 28,
            parking: {
                price: 0,
                period: 1
            }
        },
        wvcodes: {
            codes: ['WV1', 'WV2', 'WV3', 'WV4', 'WV5', 'WV6', 'WV7', 'WV8', 'WV9', 'WV10', 'WV11', 'WV12', 'WV13', 'WV14'],
            price: 0,
            plasterboard: 60,
            noticePeriod: 3,
            validPeriod: 28,
            parking: {
                price: 0,
                period: 1
            }
        },
        xtatcodes: {
            codes: ['XTAT'],
            price: 0,
            plasterboard: 0,
            noticePeriod: 0,
            validPeriod: 0,
            parking: {
                price: 0,
                period: 0
            }
        },
        stcodes: {
            codes: ['ST19'],
            price: 0,
            plasterboard: 60,
            noticePeriod: 3,
            validPeriod: 28,
            parking: {
                price: 0,
                period: 1
            }
        }
    },
    getCouncil: function (postCode) {
        var list = Object.keys(this.councils);
        var result = false;
        for (key in list) {
            if (this.councils[list[key]].codes.indexOf(postCode) > -1) result = this.councils[list[key]];
        }
        return result;
    }
};

function checkParkingPermit($) {
    var location = $('#postcode-select').val();
    var publicRoad = $('#land-type-public').is(':checked');
    var council = postCodes.getCouncil(location);
    // console.log(council.parking);
    if (council.parking && publicRoad) {
        // console.log('parking fee applies');
        $('.parking-permit-wrapper').slideDown();
    } else {
        $('#parking-permit-none').prop('checked', true);
        $('#adons1').prop('checked', true);
        $('.parking-permit-wrapper').slideUp();
        $('.addons-parking-permit-wrapper').slideUp();
        $("#council-options").val($("#council-options option:first").val());
    }
}

function showOtherOptions($) {
    var addoncheck = $('#land-type-public').is(':checked');
    if (addoncheck) {
        // console.log('parking fee applies');
        $('.addons-parking-permit-wrapper').slideDown();
    } else {
        $('#adons1').prop('checked', true);
        $('.addons-parking-permit-wrapper').slideUp();
        $("#council-options").val($("#council-options option:first").val());
    }
}

function calculatePrice($) {
    var location = $('#postcode-select').val();
    var size = $('#skip-size-select').val();
    var publicRoad = $('#land-type-public').is(':checked');
    var plasterBoard = $('#waste-type-bs').is(':checked'); // NEW VARIABLE FOR PLASTERBOARD
    var parkingPermit = publicRoad;
    var adons1 = $('#adons1').is(':checked');
    var adons2 = $('#adons2').is(':checked');
    var adons3 = $('#adons3').is(':checked');
    var adons4 = $('#adons4').is(':checked');
    var datexstart = jQuery('#hire-period-input-from').val();
    var datexend = jQuery('#hire-period-input-until').val();
    var com1 = datexstart.replace(/\-/g, '/');
    var com2 = datexend.replace(/\-/g, '/');
    var tressx1 = com1.substr(0, 2);
    var tressx2 = com1.substr(3, 2);
    var tressx3 = com1.substr(6, 9);
    var tnewdatestart = tressx2 + '/' + tressx1 + '/' + tressx3;
    var tressy1 = com2.substr(0, 2);
    var tressy2 = com2.substr(3, 2);
    var tressy3 = com2.substr(6, 9);
    var tnewdateend = tressy2 + '/' + tressy1 + '/' + tressy3;
    var period = showDays(tnewdatestart, tnewdateend);
    var price = getPrice(location, size, publicRoad, parkingPermit, period, plasterBoard); //plasterBoard VARIABLE ADDED BY WPMANILA DATE MAY 18 2017
    $('#quoted-price').find('span').html(price);
    $('#xquoted-price').find('span').html(price);
}

function getPrice(location, size, publicRoad, parkingPermit, days, plasterBoard) { //plasterBoard VARIABLE ADDED BY WPMANILA DATE MAY 18 2017
    var council = postCodes.getCouncil(location);
    var options = ['2', '4', '8', '10', '12', '14', '12e', 'permit'];
    var pricelist = {
        //FIRST SET OF POSTCODE BY MANILAWP ROMEL LOZENDO DATE MAY 17 2017
        WS1: [95, 125, 175],
        WS2: [95, 125, 175],
        WS3: [100, 130, 180],
        WS4: [95, 125, 175],
        WS5: [100, 130, 180],
        WS6: [100, 130, 180],
        WS8: [105, 135, 185],
        WS9: [105, 135, 185],
        WS10: [90, 120, 170],
        WS11: [95, 125, 175],
        WS12: [105, 135, 185],
        //SECOND SET OF POSTCODE BY MANILAWP ROMEL LOZENDO DATE MAY 17 2017
        B71: [90, 120, 170],
        B70: [90, 120, 170],
        B69: [90, 120, 170],
        B68: [90, 120, 170],
        B67: [95, 125, 175],
        B66: [90, 120, 170],
        B65: [90, 120, 170],
        B64: [95, 125, 175],
        B63: [95, 125, 175],
        B62: [95, 125, 175],
        B43: [95, 125, 175],
        B42: [95, 125, 175],
        B17: [115, 145, 195],
        B18: [120, 150, 200],
        B20: [120, 150, 200],
        B21: [120, 150, 200],
        //THIRD SET OF POSTCODE BY MANILAWP ROMEL LOZENDO DATE MAY 17 2017
        B1: [120, 150, 200],
        B2: [120, 150, 200],
        B3: [120, 150, 200],
        B4: [120, 150, 200],
        B5: [120, 150, 200],
        //FOURTH SET OF POSTCODE BY MANILAWP ROMEL LOZENDO DATE MAY 17 2017
        DY1: [90, 120, 170],
        DY2: [90, 120, 170],
        DY3: [90, 120, 170],
        DY4: [90, 120, 170],
        DY5: [90, 120, 170],
        DY6: [95, 125, 175],
        DY7: [95, 125, 175],
        DY8: [100, 130, 180],
        DY10: [100, 130, 180],
        //FIFTH SET OF POSTCODE BY MANILAWP ROMEL LOZENDO DATE MAY 17 2017
        WV1: [90, 120, 170],
        WV2: [90, 120, 170],
        WV3: [90, 120, 170],
        WV4: [90, 120, 170],
        WV5: [90, 120, 170],
        WV6: [95, 125, 170],
        WV7: [95, 125, 170],
        WV8: [90, 120, 170],
        WV9: [90, 120, 170],
        WV10: [90, 120, 170],
        WV11: [90, 120, 170],
        WV12: [90, 120, 170],
        WV13: [90, 120, 170],
        WV14: [90, 120, 170],
        //FIFTH SET OF POSTCODE BY MANILAWP ROMEL LOZENDO DATE MAY 17 2017
        ST19: [110, 140, 190],
        //DUMMY PLACEHOLDER POSTCODE BY MANILAWP ROMEL LOZENDO DATE MAY 17 2017
        XTAT: [0, 0, 0]
    };

    /**
     *
     *
     * Calculate the period (based on days)
     *
     *
     */
        // PRICING is valid PER 2 week period!!!!!!
        // NOT PER DAY!
        // we split the number of days into 'periods of 2 weeks'
    var nr_of_weeks = Math.floor(days / 14);
    var nr_of_rem_days = days % 14;
    // if we have more dan 4 days, we are going into the next period, so we add one
    var add_period = (nr_of_rem_days > 4) ? 1 : 0;
    var period = nr_of_weeks + add_period;
    if (period == 0 || isNaN(period)) period = 1;

    /**
     *
     *
     * Calculate the plasterboard
     *
     *
     */
    var plasterBoardCharge = 0;
    if (plasterBoard) {
        var pbCharge = Math.ceil(period / council.validPeriod);
        if (pbCharge == 0 || isNaN(pbCharge)) pbCharge = 1;
        plasterBoardCharge = council.plasterboard * period;//pbCharge;
    }

    // ADD THE PLASTERBOARD PRICE IF SELECTED END.. BY MANILAWP ROMEL LOZENDO DATE MAY 18 2017

    /**
     *
     *
     * Calculate the PERMIT
     *
     *
     */
    var xtotal = 0;
    var counciloptions = jQuery('#council-options').val();
    if (counciloptions == "1" || counciloptions == "2" || counciloptions == "4") {
        /* xtotal = price X period */
        xtotal = 35 * Math.ceil(days / 28);
    } else if (counciloptions == "3") {
        /* xtotal = price X days */
        xtotal = 20 * days;
    } else {
        xtotal = 0;
    }

    // some debug
    // console.log("+++++++++++++++++++++++++++++");
    // console.log("pricelist:" + pricelist[location][options.indexOf(size)] * period);
    // console.log("period:" + period);
    // console.log("plasterBoardCharge:" + plasterBoardCharge);
    // console.log("xtotal:" + xtotal);

	/* MOD. 2018/03/28 WPDEV-1743 */
	var today = new Date();
	var target = new Date( '2018/04/01' );

	if( today > target )
	{
		price = (((pricelist[location][options.indexOf(size)] * period) + plasterBoardCharge)*1.20 + xtotal) + 11;
	}
	else {
		price = ((pricelist[location][options.indexOf(size)] * period) + plasterBoardCharge)*1.20 + xtotal;
	}

	// ADD £10 TO THE PRICE WPBAU-2122
	price = price + 10;

    return price;
}

function showDays(firstDate, secondDate) {

    var startDay = new Date(firstDate);
    var endDay = new Date(secondDate);
    var millisecondsPerDay = 1000 * 60 * 60 * 24;
    var millisBetween = startDay.getTime() - endDay.getTime();
    var days = millisBetween / millisecondsPerDay;

	//dont include 22/12/18 to 01/01/19 in calculation of days
    var currentDate = new Date();
    var currentYear = currentDate.getFullYear();
    var newYear = currentDate.getFullYear() + 1;
    var booked_array = [currentYear+"-12-22", currentYear+"-12-23", currentYear+"-12-24", currentYear+"-12-25", currentYear+"-12-26", currentYear+"-12-27", currentYear+"-12-28", currentYear+"-12-29", currentYear+"-12-30", currentYear+"-12-31", newYear+"-01-01",currentYear+"-05-31",currentYear+"-08-30"];    
    for (let i=0; i<booked_array.length; i++) {
        var bookedDay = new Date(booked_array[i]);
		if( (bookedDay.getTime() >= startDay.getTime()) && (bookedDay.getTime() <= endDay.getTime()) )
		{
			if(days < 0) days++;
        }
    }

    // Round down.
    var xior = Math.floor(days);
    var valuedate = Math.abs(xior);
    valuedate = valuedate + 1;
    //console.log(valuedate);
    return valuedate;
}

function contains(a, obj) {
    var i = a.length;
    while (i--) {
       if (a[i] === obj) {
           return true;
       }
    }
    return false;
}