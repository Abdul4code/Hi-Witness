report = JSON.parse(localStorage.getItem('report'))

if(report){
    display_meta_report(report)
    display_manipulation_report(report)
    display_location_report(report)
    display_time_report(report)

    console.log(report)
}else{
    window.location.href = 'verify'
}


function display_meta_report(report) {
    meta_report = report['meta']

    $('.meta-cont').text(meta_report['message'])

    if (meta_report['success']) {
        $('.meta-data .mark-icon img').attr('src', '/static/images/correct.png');
        $('.meta-data .mark-perc').text('100%');
    } else {
        $('.meta-data .mark-icon img').attr('src', '/static/images/cross.png');
        $('.meta-data .mark-perc').text('0%');
    }
}

function display_manipulation_report(report) {
    alert()
    meta_report = report['auth']

    if (meta_report['success']) {
        if(meta_report['message'] >= 0.4){
            $('.manipulated-cont').text('The attached image has been manipulated. ')
            $('.manipulated .mark-icon img').attr('src', '/static/images/cross.png');
            $('.manipulated .mark-perc').text((100 - parseFloat(meta_report['message'])).toFixed(2) + '%');
        }else if (meta_report['message'] < 0.1) {
            $('.manipulated-cont').text('The attached image has been verified to be VERY authentic. ')
            $('.manipulated .mark-icon img').attr('src', '/static/images/correct.png');
            $('.manipulated .mark-perc').text((100 - parseFloat(meta_report['message'])).toFixed(2) + '%');
        }else if (meta_report['message'] < 0.2) {
            $('.manipulated-cont').text('The attached image has been verified to be authentic. ')
            $('.manipulated .mark-icon img').attr('src', '/static/images/correct.png');
            $('.manipulated .mark-perc').text((100 - parseFloat(meta_report['message'])).toFixed(2) + '%');
            $('.manipulated-cont').text('The attached image has been verified to be WEAKLY authentic. ')
            $('.manipulated .mark-icon img').attr('src', '/static/images/correct.png');
            $('.manipulated .mark-perc').text((100 - parseFloat(meta_report['message'])).toFixed(2) + '%');
        }
    } else{
        $('.manipulated-cont').text(meta_report['message'])
        $('.manipulated .mark-icon img').attr('src', '/static/images/cancel.png');
        $('.manipulated .mark-perc').text(0 + '%');
    }
}

function display_location_report(report){
    meta_report = report['compare']
    if(meta_report['success']){
        success_vals = meta_report['message']
        var match_pattern = /^[A-Za-z\s]+$/;

        var matches = success_vals['results'][0].match(match_pattern);
        var extractedMatch = matches[0].toLowerCase();

        html = `
                    <table class="table table-bordered table-striped">
                        <thead class="table-dark">
                        <tr>
                            <th>Image Content</th>
                            <th>Report Content</th>
                            <th>Match</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td> ${success_vals['place']} </td>
                            <td> ${success_vals['summary'][0]} </td>
                            <td> ${extractedMatch} </td>
                        </tr>
                        <tr>
                        </tbody>
                    </table>
                `
            $('.loc-cont').append(html)

        if(extractedMatch == true){
            $('.location .mark-icon img').attr('src', '/static/images/correct.png');
            $('.location .mark-perc').text('100%');
        }else{
            $('.location .mark-icon img').attr('src', '/static/images/cross.png');
            $('.location .mark-perc').text('0%');
        }
        
        console.log(meta_report['message'])
    }else{
        $('.loc-cont').text(meta_report['message'])
    }
}

function display_time_report(report) {
    meta_report = report['compare']
    if(meta_report['success']){
        success_vals = meta_report['message']
        var match_pattern = /^[A-Za-z\s]+$/;
        var match_pattern_perc = /\d+%/;

        // matching year 
        var year_matches = success_vals['results'][1].match(match_pattern);
        var year_extractedMatch = year_matches[0].toLowerCase();

        // matching month 
        var month_matches = success_vals['results'][2].match(match_pattern);
        var month_extractedMatch = month_matches[0].toLowerCase();

        // matching day 
        var day_matches = success_vals['results'][3].match(match_pattern);
        var day_extractedMatch = day_matches[0].toLowerCase();

        // matching hour percentage 
        var hour_matches = success_vals['results'][4].match(match_pattern_perc);
        if(hour_matches){
            var hour_extractedMatch = hour_matches[0];
        }else{
            var hour_extractedMatch = 'false';
        }
        
        // matching min percentage 
        var min_matches = success_vals['results'][5].match(match_pattern_perc);
        if(min_matches){
            var min_extractedMatch = min_matches[0];
        }else{
            var min_extractedMatch = 'false';
        }

        // matching period 
        var per_matches = success_vals['results'][6].match(match_pattern);
        var per_extractedMatch = per_matches[0].toLowerCase();

        total_perc = compute_percentage([year_extractedMatch, month_extractedMatch, day_extractedMatch, hour_extractedMatch, min_extractedMatch, per_extractedMatch])

        html = `
                    <table class="table table-bordered table-striped">
                        <thead class="table-dark">
                            <tr>
                                <th>Time Param</th>
                                <th>Image Content</th>
                                <th>Report Content</th>
                                <th>Match</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Year</td>
                                <td>${success_vals['time']['year']}</td>
                                <td>${success_vals['summary'][1]}</td>
                                <td>${year_extractedMatch}</td>
                            </tr>
                            <tr>
                                <td>Month</td>
                                <td>${success_vals['time']['month']}</td>
                                <td>${success_vals['summary'][2]}</td>
                                <td>${month_extractedMatch}</td>
                            </tr>
                            <tr>
                                <td>Day</td>
                                <td>${success_vals['time']['day']}</td>
                                <td>${success_vals['summary'][3]}</td>
                                <td>${day_extractedMatch}</td>
                            </tr>
                            <tr>
                                <td>Hours</td>
                                <td>${success_vals['time']['hour']}</td>
                                <td>${success_vals['summary'][4]}</td>
                                <td>${hour_extractedMatch}</td>
                            </tr>
                            <tr>
                                <td>Mins</td>
                                <td>${success_vals['time']['min']}</td>
                                <td>${success_vals['summary'][5]}</td>
                                <td>${min_extractedMatch}</td>
                                </tr>
                            <tr>
                            <tr>
                                <td>Period</td>
                                <td>${success_vals['time']['meridian']}</td>
                                <td>${success_vals['summary'][6]}</td>
                                <td>${per_extractedMatch}</td>
                                </tr>
                            <tr>
                        </tbody>
                </table>
                `
            $('.time-cont').append(html)

            $('.time .mark-perc').text(Math.round(total_perc) + '%');

        if(Math.round(total_perc) > 90){
            $('.time .mark-icon img').attr('src', '/static/images/correct.png'); 
        }else{
            $('.time .mark-icon img').attr('src', '/static/images/verify.png');
        }

    }else{
        $('.time-cont').text(meta_report['message'])
    }
}

function compute_percentage(list_values){
    total_percent = 0
    for(var i = 0; i < list_values.length; i++){
        var perc =  parseInt(list_values[i])
        if(perc){
            total_percent += perc
        }else if(list_values[i] == 'true'){
            total_percent += 100
        }else if(list_values[i] == 'false'){
            total_percent += 0
        }
    }
    return total_percent / list_values.length
}