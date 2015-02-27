/*!
 * Contact Form and AntiSpam Javascript Plugin
 * Author: Marcz Hermo
 * Email: marcz@lab1521.com
 * Copyright 2015 Lab1521 Limited
 */
smoothScroll.init({
    speed: 1000,
    easing: 'easeInOutCubic',
    offset: 0,
    updateURL: true,
    callbackBefore: function ( toggle, anchor ) {},
    callbackAfter: function ( toggle, anchor ) {}
});
(function ($) { 'use strict';

    /**
     * AntiSpam Form Plugin
     * @param inputAnswer
     * @param inputToken
     * @param inputRefresh
     * @param inputQuestion
     * @constructor
     */
    var AntiSpam = function (inputAnswer, inputToken, inputRefresh, inputQuestion) {
        this.$inputAnswer = inputAnswer;
        this.$inputToken = inputToken;
        this.$inputRefresh = inputRefresh;
        this.$inputQuestion = inputQuestion;
        this.answer = '';
        this.token = '';
        this.url = 'contact.php';

        this.init();
    };

    AntiSpam.prototype.init = function () {
        this.reload();
        this.$inputRefresh.on('click', this.reload.bind(this));
    };

    AntiSpam.prototype.reload = function () {
        $.when(
            $.ajax({
                url: this.url,
                dataType: 'json'
                })
            )
        .done(
            this.update.bind(this)
        );
    };

    AntiSpam.prototype.update = function (data) {
        this.$inputToken.val(data['client']);
        this.$inputQuestion.text(data['question']);
        this.$inputAnswer.val('');
    };


    /**
     * Contact Form Plugin
     * @param form
     * @constructor
     */
    var ContactForm = function (form, antiSpam) {
        this.antiSpam = antiSpam;
        this.$form = form;
        this.url = 'contact.php';
    };

    ContactForm.prototype.post = function (data) {
        $.when(
            $.ajax({
                url: this.url,
                data: data,
                dataType: 'json',
                type: "POST"
            })
        ).done(
            this.update.bind(this)
        );
    };

    ContactForm.prototype.update = function (data) {
        if (data['success'] === true) {
            this.success();
        }

        this.warnings.call(this, data);
    };

    ContactForm.prototype.success = function () {
        var $form = this.$form;
        var $formAlert = $form.find('.form-alert').show();
        var $alert = $('.alert', $formAlert).removeClass('alert-danger').addClass('alert-success');
        $alert.html('<strong>Success!</strong> We will contact you as soon as possible.');

        var glyphicon = $form.find('.glyphicon');
        glyphicon.removeClass('glyphicon-remove glyphicon-ok').addClass('glyphicon-asterisk');

        $form.find('input').val('');
        $form.find('textarea').val('');
    }

    ContactForm.prototype.warnings = function (data) {
        var notices = data['notices'];
        var self = this;

        this.antiSpam.reload();

        for (var index = 0; index < notices.length; index++) {
            var notice = notices[index];
            $.each(notice, function (key, value) {
                self.warn.call(self, key, value);
            });
        }
    }

    ContactForm.prototype.warn = function (name, value) {
        var $form = this.$form;
        var glyphicon = $form.find('[name='+name+'] ~ .glyphicon');

        if (glyphicon.length) {
            glyphicon.removeClass('glyphicon-asterisk glyphicon-ok').addClass('glyphicon-remove');
        } else {
            if ((name != 'antiSpamAnswer' && name != 'antiSpamToken')) {
                this.showError.call(this, value);
            }
        }
    }

    ContactForm.prototype.showError = function (texts) {
        var $form = this.$form;
        var $formAlert = $form.find('.form-alert').show();
        var $alert = $('.alert', $formAlert).removeClass('alert-success').addClass('alert-danger');

        $alert.html('<strong>Error!</strong> ' + texts);
    }

    ContactForm.prototype.hideAlert = function () {
        var $form = this.$form;
        var $formAlert = $form.find('.form-alert').hide();
        $('.alert', $formAlert).removeClass('alert-success alert-danger').html('');
    }

    ContactForm.prototype.submit = function (data) {
        var $form = this.$form;

        this.hideAlert();

        for (var index = 0; index < data.length; index++) {
            var input = data[index];
            var glyphicon = $form.find('[name='+input['name']+'] ~ .glyphicon');
            if (input['value'] == '') {
                glyphicon.removeClass('glyphicon-asterisk glyphicon-ok').addClass('glyphicon-remove');
	            $form.find('[name='+input['name']+']').focus();
                return;
            } else {
                glyphicon.removeClass('glyphicon-asterisk glyphicon-remove').addClass('glyphicon-ok');
            }
        }

        this.post.call(this, data);
    };


    //ready
    $(function(){

        var antiSpam = new AntiSpam(
            $('#antiSpamAnswer'),
            $('#antiSpamToken'),
            $('#antiSpamRefresh'),
            $('#antiSpamQuestion')
        );

        var contact = new ContactForm($('#contactForm'), antiSpam);

        $('#contactForm').on('submit', function (event) {
            contact.submit.call(contact, $(this).serializeArray());

            event.preventDefault();
        });

    });
})(jQuery);
