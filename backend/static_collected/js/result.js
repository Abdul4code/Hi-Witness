report = JSON.parse(localStorage.getItem('report'))

if(report){
    display_meta_report(report)
    display_manipulation_report(report)
    display_location_report(report)
    display_time_report(report)
    compute_general_report()
}else{
    window.location.href = 'verify'
}

// Add event listener to the window's beforeunload event
window.addEventListener('beforeunload', function() {
    // Remove the item from localStorage
    localStorage.removeItem('report');
});
  


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
    meta_report = report['auth']

    if (meta_report['success']) {
        if(meta_report['message'] >= 0.4){
            $('.manipulated-cont').text('The attached image has been manipulated. ')
            $('.manipulated .mark-icon img').attr('src', '/static/images/cross.png');
            $('.manipulated .mark-perc').text((1 - parseFloat(meta_report['message'])).toFixed(4) * 100 + '%');
        }else if (meta_report['message'] < 0.1) {
            $('.manipulated-cont').text('The attached image has been verified to be VERY authentic. ')
            $('.manipulated .mark-icon img').attr('src', '/static/images/correct.png');
            $('.manipulated .mark-perc').text((1 - parseFloat(meta_report['message'])).toFixed(4) * 100 + '%');
        }else if (meta_report['message'] < 0.2) {
            $('.manipulated-cont').text('The attached image has been verified to be authentic. ')
            $('.manipulated .mark-icon img').attr('src', '/static/images/correct.png');
            $('.manipulated .mark-perc').text((1 - parseFloat(meta_report['message'])).toFixed(4) * 100 + '%');
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
        var extractedMatch = success_vals['results'][0];

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
        
    }else{
        $('.loc-cont').text(meta_report['message'])
    }
}

function display_time_report(report) {
    meta_report = report['compare']
    if(meta_report['success']){
        success_vals = meta_report['message']

        // matching year 
        var year_extractedMatch = success_vals['results'][1]

        // matching month 
        var month_extractedMatch = success_vals['results'][2];

        // matching day 
        var day_extractedMatch = success_vals['results'][3];

        // matching hour percentage

        if (success_vals['results'][4] != 'unknown'){
            var hour_extractedMatch = success_vals['results'][4];
        }else{
            hour_extractedMatch = false
        }
        
        // matching min percentage 
        if(success_vals['results'][5] != 'unknown'){
            var min_extractedMatch = success_vals['results'][5];
        }else{
            var min_extractedMatch = 'false';
        }

        // matching period 
        var per_extractedMatch = success_vals['results'][6];
        weights = [5, 5, 3, 5, 1, 1]
        total_perc = compute_percentage([year_extractedMatch, month_extractedMatch, day_extractedMatch, hour_extractedMatch, min_extractedMatch, per_extractedMatch], weights)
        

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
        }else if(Math.round(total_perc) < 50){
            $('.time .mark-icon img').attr('src', '/static/images/cross.png');
        }else{
            $('.time .mark-icon img').attr('src', '/static/images/verify.png');
        }

    }else{
        $('.time-cont').text(meta_report['message'])
    }
}

function compute_general_report(){
    values = [
            parseFloat($('.meta-data .mark-perc')[0].innerHTML),
            parseFloat($('.manipulated .mark-perc')[0].innerHTML),
            parseFloat($('.location .mark-perc')[0].innerHTML),
            parseFloat($('.time .mark-perc')[0].innerHTML)
            
    ]

    weights = [5, 3, 3, 2]

    total_perc = compute_percentage(values, weights)

    $('.comment-cont').text(Math.round(total_perc) + '%')

}

function compute_percentage(list_values, weights){
    total_percent = 0
    for(var i = 0; i < list_values.length; i++){
        var perc =  parseInt(list_values[i]) * weights[i]
        if(perc){
            total_percent += perc
        }else if(list_values[i] === true){
            total_percent += (100 * weights[i])
        }else if(list_values[i] === false){
            total_percent += 0
        }

    }
    const sum = weights.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    return total_percent / sum
}