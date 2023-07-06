report = JSON.parse(localStorage.getItem('report'))

if(report){
    display_meta_report(report)
}else{
    window.location.href = 'verify'
}


function display_meta_report(report){
    meta_report = report['meta']

    $('.meta-cont').text(meta_report['message'])

    if(meta_report['success']){
        
    }
}