var namazTimes = [];

function DrawLine(x1, y1, x2, y2, lineWidth, canvasObjID)
{
    var c=document.getElementById(canvasObjID);
    var ctx=c.getContext("2d");
    ctx.lineWidth = lineWidth;
    ctx.fillStyle='rgb(0,255,0)';
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.stroke();
}

function DrawHourLines()
{
    var loop;
    var angle;
    var x1, y1;
    var x2, y2;
    for (loop = 0; loop < 12; loop++)
    {
        if ((loop+1)%3 !== 0)
            {
                var d = new Date();
                d.setHours(loop+1);
                d.setMinutes(0);
                var hourAngleDegree = CalculateHourAngle(d);
                var hourAngleStart = hourAngleDegree+270;
                hourAngleStart = hourAngleStart*Math.PI/180;
                x2 = Math.cos(hourAngleStart)*radius+centerX;
                y2 = Math.sin(hourAngleStart)*radius+centerY;
                x1 = Math.cos(hourAngleStart)*(radius-20)+centerX;
                y1 = Math.sin(hourAngleStart)*(radius-20)+centerY;
                DrawLine(x1, y1, x2, y2, 4, 'ClockCanvas');
            }
    }
    
    //paste the picture of 4 90 degree hours
    var c=document.getElementById('ClockCanvas');
    var ctx=c.getContext("2d");
    var TwelveImage = document.getElementById('TwelveImage');
    ctx.drawImage(TwelveImage, centerX-(radius/5/2), centerY-radius, radius/4, radius/5);
    var ThreeImage = document.getElementById('ThreeImage');
    ctx.drawImage(ThreeImage, centerX+radius-(radius/5), centerY-(radius/5/2), radius/5, radius/5);
    var SixImage = document.getElementById('SixImage');
    ctx.drawImage(SixImage, centerX-(radius/5/2), centerY+radius-(radius/5), radius/5, radius/5);
    var NineImage = document.getElementById('NineImage');
    ctx.drawImage(NineImage, centerX-radius, centerY-(radius/5/2), radius/5, radius/5);
}

function SetCurrentTime()
{
	var currentDate = new Date();
	var hourAngle = CalculateHourAngle(currentDate)+180;
	var minuteAngle = CalculateMinuteAngle(currentDate)+180;
	$('#HourHand').css('transform', 'rotate('+hourAngle+'deg)');
	$('#MinuteHand').css('transform', 'rotate('+minuteAngle+'deg)');
}

function CalculateMinuteAngle(currentDate)
{
	return 6 * currentDate.getMinutes();
}

function CalculateHourAngle(currentDate)
{
	return ((60*currentDate.getHours()) + currentDate.getMinutes())/2;
}

function DrawClock(container, calcMethod, namazDate, location, GMT, providedMeridiem)
{
	//Set initial adjustments w.r.t. Hanafi Calendar
	if (calcMethod == undefined || calcMethod.toLowerCase() == 'hanafi')
	{
		prayTimes.setMethod('karachi');
		prayTimes.adjust( {asr: 'Hanafi', isha: 18.2} );
		prayTimes.tune( {fajr:2, sunrise: -2, dhuhr:5, asr:5, sunset: 2, isha:5} );
	}
	
	//Making clock circle
	canvas = document.getElementById('ClockCanvas');
	context = canvas.getContext('2d');
	containerWidth = container.prop('width');
	containerHeight = container.prop('height');
	context.clearRect ( 0 , 0 , containerWidth , containerHeight );
	centerX = containerWidth/2;
	centerY = containerHeight/2;
	radius = 0;
	if (containerWidth > containerHeight)
		radius = containerHeight/2 * (80/100);
	else
		radius = containerWidth/2 * (80/100);

	context.beginPath();
	context.moveTo(centerX,centerY);
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
	context.fillStyle = '#8F8F8F';
	context.fill();
	context.lineWidth = 4;
	// context.strokeStyle = '#303030';
	// context.stroke();
	context.closePath();
	
	//Making Minute Hand
	var minuteHand = $('#MinuteHand');
	minuteHand.css('height', radius*85/100);
	minuteHand.css('left', centerX+7);
	minuteHand.css('top', centerY+7);
	
	//Making HourHand
	var hourHand = $('#HourHand');
	hourHand.css('height', radius*55/100);
	hourHand.css('left', centerX+7);
	hourHand.css('top', centerY+7);
	
	//Draw Namaz Times
	if (namazDate === undefined)
		namazDate = new Date();
	if (location === undefined)
		location = [24.8667, 67.05];
	if (GMT === undefined)
		GMT = 5;
	
	ShowNamazTimes(namazDate, location, GMT, providedMeridiem);
	DrawNamazTimes($('#LegendCanvas'));
        DrawHourLines();
}

function HighlightTime(startTime, endTime, endBeforeMin, colorScheme, providedMeridiem)
{
	var startHour = startTime.split(':')[0];
	var startMinute = startTime.split(':')[1].split(' ')[0];
	var startMeridiem = startTime.split(':')[1].split(' ')[1];
	var endHour = endTime.split(':')[0];
	var endMinute = endTime.split(':')[1].split(' ')[0]-endBeforeMin;
	if (endMinute < 0)
	{
		endMinute = 60 + endMinute;
		endHour -= 1;
	}
	var endMeridiem = endTime.split(':')[1].split(' ')[1];
	var currentDate = new Date();
	var currentMeridiem = 0;
	
	//pushing namaz times in array to show legend
	endTime = endHour+':'+endMinute+' '+endMeridiem;
	var namazTime = {startTime:'00:00 am', endTime:'00:00 am'};
	namazTime.startTime = startTime;
	namazTime.endTime = endTime;
	namazTimes.push(namazTime);	
	
	if (providedMeridiem == undefined)
	{
		currentMeridiem = GetMeridiem(currentDate);
	}
	else
		currentMeridiem = providedMeridiem;
	
	if (startMeridiem == endMeridiem && startMeridiem == currentMeridiem)//when start and end time both falls in current meridiem then draw a simple pie w.r.t. start and end angle
	{
		var tempTime = new Date();
	
		tempTime.setHours(startHour);
		tempTime.setMinutes(startMinute);
		var hourAngleStart = CalculateHourAngle(tempTime)-90;
		hourAngleStart = hourAngleStart*Math.PI/180;
				
		tempTime.setHours(endHour);
		tempTime.setMinutes(endMinute);
		var hourAngleEnd = CalculateHourAngle(tempTime)-90;
		hourAngleEnd = hourAngleEnd*Math.PI/180;
		
		context.beginPath();
		context.moveTo(centerX, centerY);
		context.arc(centerX,centerY,radius,hourAngleStart,hourAngleEnd,false); 
		context.closePath();
		context.fillStyle = colorScheme;
		context.fill();
	}
	else if (startMeridiem != endMeridiem && startMeridiem == currentMeridiem)//when start and end time are in different meridiem but start time falls in current meridiem
                                                                                    //then we will draw a pie from start angle to 12 o clock and to show the rest of the time we will
                                                                                    //will only draw an arc (borders only) from 12 0 clock to end wngle																		
	{
		var tempTime = new Date();
	
		tempTime.setHours(startHour);
		tempTime.setMinutes(startMinute);
		var hourAngleStart = CalculateHourAngle(tempTime)-90;
		hourAngleStart = hourAngleStart*Math.PI/180;
				
		tempTime.setHours(0);
		tempTime.setMinutes(0);
		var hourAngleEnd = CalculateHourAngle(tempTime)-90;
		hourAngleEnd = hourAngleEnd*Math.PI/180;
		
		context.beginPath();
		context.moveTo(centerX, centerY);
		context.arc(centerX,centerY,radius,hourAngleStart,hourAngleEnd,false); 
		context.closePath();
		context.fillStyle = colorScheme;
		context.fill();
		
		tempTime.setHours(0);
		tempTime.setMinutes(0);
		hourAngleStart = CalculateHourAngle(tempTime)-90;
		hourAngleStart = hourAngleStart*Math.PI/180;
		tempTime.setHours(endHour);
		tempTime.setMinutes(endMinute);
		hourAngleEnd = CalculateHourAngle(tempTime)-90;
		hourAngleEnd = hourAngleEnd*Math.PI/180;
		
		context.strokeStyle = colorScheme.replace(', 0.3', ', 1.0');
		context.lineWidth = 16;
		context.moveTo(centerX, centerY+radius);
		context.beginPath();
		context.arc(centerX,centerY,radius+8,hourAngleStart,hourAngleEnd,false);
		context.stroke();
	}	
	else if (startMeridiem != endMeridiem && endMeridiem == currentMeridiem)//when start and end time are in different meridiem but end time falls in current meridiem
                                                                                //then we will draw an arc (borders only) from start angle to 12 o clock and to show the rest of the time we will
                                                                                //will only draw a pie from 12 0 clock to end wngle																		
	{
			var tempTime = new Date();
			
			tempTime.setHours(startHour);
			tempTime.setMinutes(startMinute);
			hourAngleStart = CalculateHourAngle(tempTime)-90;
			hourAngleStart = hourAngleStart*Math.PI/180;
			tempTime.setHours(0);
			tempTime.setMinutes(0);
			hourAngleEnd = CalculateHourAngle(tempTime)-90;
			hourAngleEnd = hourAngleEnd*Math.PI/180;
			
			context.strokeStyle = colorScheme;
			context.lineWidth = 16;
			context.beginPath();
			context.arc(centerX,centerY,radius+8,hourAngleStart,hourAngleEnd,false);
			context.stroke();
		
			tempTime.setHours(0);
			tempTime.setMinutes(0);
			var hourAngleStart = CalculateHourAngle(tempTime)-90;
			hourAngleStart = hourAngleStart*Math.PI/180;
					
			tempTime.setHours(endHour);
			tempTime.setMinutes(endMinute);
			var hourAngleEnd = CalculateHourAngle(tempTime)-90;
			hourAngleEnd = hourAngleEnd*Math.PI/180;
			
			context.beginPath();
			context.moveTo(centerX, centerY);
			context.arc(centerX,centerY,radius,hourAngleStart,hourAngleEnd,false); 
			context.closePath();
			context.fillStyle = colorScheme;
			context.fill();
        }
}

function GetMeridiem(currentDate)
{
	var currentMeridiem = 0;
	currentMeridiem = (currentDate.getHours()-12);
	if (currentMeridiem < 0)
	{
		currentMeridiem = 'am';
	}
	else if (currentMeridiem > 0)
	{
		currentMeridiem = 'pm';
	}
	else if (currentMeridiem == 0)
	{
		currentMeridiem = (currentDate.getMinutes()-60);
		if (currentMeridiem < 0)
		{
			currentMeridiem = 'am';
		}
		else
		{
			if (currentMeridiem == 0)
			{
				currentMeridiem = (currentDate.getSeconds()-60);
				if (currentMediem < 0)
					currentMeridiem = 'am';
				else
					currentMeridiem = 'pm';
			}
			else
				currentMeridiem = 'pm';
		}
	}
	return currentMeridiem;
}

function ShowNamazTimes(namazDate, location, GMT, providedMeridiem)
{
	var times = prayTimes.getTimes(namazDate, location, GMT, 'auto', '12h');
	namazTimes = [];
	HighlightTime(times.fajr, times.sunrise, 0, 'rgba(255, 204, 0, 0.6)', providedMeridiem);//fajr
	HighlightTime(times.dhuhr, times.asr, 10, 'rgba(0, 205, 0, 0.6)', providedMeridiem);//dhuhr
	HighlightTime(times.asr, times.sunset, 7, 'rgba(255, 102, 0, 0.6)', providedMeridiem);//asr
	HighlightTime(times.sunset, times.isha, 7, 'rgba(115, 44, 123, 0.6)', providedMeridiem);//maghrib
	HighlightTime(times.isha, times.fajr, 7, 'rgba(8, 93, 173, 0.6)', providedMeridiem);//isha
}

function DrawNamazTimes(namazTime)
{
	canvas = document.getElementById(namazTime.prop('id'));
	context = canvas.getContext('2d');
	context.clearRect ( 0 , 0 , 350 , 500 );
	
	context.fillStyle = '#FFCC00';
	context.fillRect(0,51,70,40);
	context.font = '20px Georgia';
	context.fillStyle = '#CCCCCC';
	context.fillText('Fajr --    Start: '+namazTimes[0].startTime+'  End: '+namazTimes[0].endTime, 75, 70, 275);
	
	context.fillStyle = '#00CD00';
	context.fillRect(0,101,70,40);
	context.font = '20px Georgia';
	context.fillStyle = '#CCCCCC';
	context.fillText('Dhuhr --   Start: '+namazTimes[1].startTime+'  End: '+namazTimes[1].endTime, 75, 120, 275);
	
	context.fillStyle = '#FF6600';
	context.fillRect(0,151,70,40);
	context.font = '20px Georgia';
	context.fillStyle = '#CCCCCC';
	context.fillText('Asr --     Start: '+namazTimes[2].startTime+'  End: '+namazTimes[2].endTime, 75, 170, 275);
	
	context.fillStyle = '#732C7B';
	context.fillRect(0,201,70,40);
	context.font = '20px Georgia';
	context.fillStyle = '#CCCCCC';
	context.fillText('Maghrib -- Start: '+namazTimes[3].startTime+'  End: '+namazTimes[3].endTime, 75, 220, 275);
	
	context.fillStyle = '#085DAD';
	context.fillRect(0,251,70,40);
	context.font = '20px Georgia';
	context.fillStyle = '#CCCCCC';
	context.fillText('Isha --    Start: '+namazTimes[4].startTime+'  End: '+namazTimes[4].endTime, 75, 270, 275);
}

function ChangeMeridiemText()
{
	if ($('#MeridiemText').text() == 'A.M.')
        {
            $('#MeridiemText').text('P.M.');
        }
	else
        {
            $('#MeridiemText').text('A.M.');
        }
	var location = [];
	location.push($('#lat').val());
	location.push($('#lng').val());
	DrawClock($('#ClockCanvas'), undefined, new Date($('#datepicker').val()), location, $('#GMT').val(), $('#MeridiemText').text().replace(/\./g, '').toLowerCase());
}

function ChangeDate()
{
	var location = [];
	location.push($('#lat').val());
	location.push($('#lng').val());
	DrawClock($('#ClockCanvas'), undefined, new Date($('#datepicker').val()), location, $('#GMT').val(), $('#MeridiemText').text().replace(/\./g, '').toLowerCase());
}

