
export default class Form_view implements Form_view {
    form: Form | undefined;
    lon_selector: string = "input#lon";
    lat_selector: string = "input#lat";
    error_selector: string = "#error_lonlat_input";
    manual_entry_selector: string = "#manual_entry_button";
    // date_selector: string;
    // time_selector: string;
    // step_selector: string | undefined;

    initEvents() {
        let form_view = this
        $('.lonlat').on('keypress', (e) => {
            if (e.key == 'Enter') $(form_view.manual_entry_selector).trigger('click');
        });

        $(document).on('click', function () {
            $(form_view.error_selector).hide("slow");
        });
    }

    get getForm() {
        if ($(".atp-prediction-form").length) {
            let option = $(".atp-prediction-form select option:selected").val() as string
            let selected_option = option?.match("(.*)@(.*)\\+(.*)")!;
            this.form = {
                lon: $(this.lon_selector).val(),
                lat: $(this.lat_selector).val(),
                date: selected_option[1].trim(),
                step: selected_option[3],
                time: selected_option[2].trim(),
            } as PredictionForm;
        } else {
            this.form = {
                date: $('.archive-form #archive_date').val()?.toString(),
                time: $('.archive-form .time-item input[type=radio]:checked').val()?.toString()
            } as ArchiveForm;
        }

        return this.form;
    }

    verifyLonLatInput() {
        let messages: string[] = [];
        let form = this.getForm as PredictionForm;

        if (form.lat == "") {
            messages.push("A latitude must be specified");
        } else if (!form.lat.match(/^\d{1,3}[,|.]?\d*$/gm)) {
            messages.push("Wrong format for latitude");
        }

        if (form.lon == "") {
            messages.push("A longitude must be specified");
        } else if (!form.lon.match(/^\d{1,3}[,|.]?\d*$/gm)) {
            messages.push("Wrong format for longitude");
        }

        return messages;
    }
}