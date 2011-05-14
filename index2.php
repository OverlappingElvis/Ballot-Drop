<?php 
require_once('mobile_device_detect.php');
mobile_device_detect(true,false,true,true,true,true,true,false,false);
?>

<!DOCTYPE html> 
<html> 

<meta property="og:title" content="Ballot Drop | Where can I vote?" />
<meta property="og:description" content="In Oregon, people can vote by mail. But if you can't find a stamp &#8211; or you just don't want to mail in your ballot – you can take it to any number of drop boxes around your community. But the question is WHERE ARE THEY? Well, now you can find out." />
<meta property="og:image" content="http://ballotdrop.org/shareable.png" />
<meta property="og:type" content="website" />
<meta property="og:region" content="OR" />

<head> 
	<title>Ballot Drop | Where can I vote?</title> 
	<meta name="viewport" content="initial-scale=1.0, user-scalable=no" /> 
	<?php if(mobile_device_detect()) : ?>
	<link rel="stylesheet" type="text/css" href="style.mobile.css" media="all" />
	<?php else: ?>
	<link rel="stylesheet" type="text/css" href="style.desktop.css" media="all" />
	<?php endif; ?>
	<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.5.2/jquery.min.js"></script> 
	<script type="text/javascript" src="http://maps.google.com/maps/api/js?sensor=true"></script> 
	<script type="text/javascript" src="jquery.html5form-1.3-min.js"></script>
	<script type="text/javascript" src="http://code.google.com/apis/gears/gears_init.js"></script> 

	<?php if(!mobile_device_detect()) : ?>
		<link rel="stylesheet" type="text/css" href="shadowbox/shadowbox.css">
		<script type="text/javascript" src="shadowbox/shadowbox.js"></script>
	<?php endif; ?>

	<script type="text/javascript" src="map2.js"></script> 
	<script type="text/javascript">

	  var _gaq = _gaq || [];
	  _gaq.push(['_setAccount', 'UA-15262316-7']);
	  _gaq.push(['_setDomainName', '.ballotdrop.org']);
	  _gaq.push(['_trackPageview']);

	  (function() {
		var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
		ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
		var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
	  })();

	</script>
</head> 

<body class="votebot"> 
	<div id="header" class="clearfix">
		<h1>Oregon Ballot Drop Box Locator</h1>
		<p style="float:left;">Search for drop boxes near you or zoom in to see Ballot Drop boxes around Oregon</p>
		<p style="float: right;"><a href="#explain" rel="shadowbox;width=800">Tell me more about this</a><span > | </span><a href="#report-problem" rel="shadowbox;width=800;height=500">Something Wrong?</a></p>
		<div id="explain">
			<h1>Democracy, Delivered</h1>
			<p>In Oregon, people can vote by mail. But if you can't find a stamp &#8211; or you just don't want to mail in your ballot – you can take it to any number of drop boxes around your community. But the question is WHERE ARE THEY? Well, now you can find out.</p>
			<p>Thanks to Oregon government's open data laws, a couple folks over here at the Bus Project Foundation decided to make this handy-dandy ballot drop box locator. With public info from the Oregon Secretary of State and a bunch of county elections offices,  <a target="_blank" href="http://twitter.com/overlapping">Overlapping</a> (aka Jeremy Sher) and <a target="_blank" href="http://twitter.com/mojowen">Mojowen</a> (aka Scott Duncombe) put this thing together. Thanks to them for making it and thanks to YOU for voting.</p>
			<p>If you wanna find out more about the Bus Project Foundation (driving innovative democracy for our generation), go to <a target="_blank" href="http://busfoundation.org">BusFoundation.org</a>.</p>
		</div>
		<div id="report-problem">
			<h1>Something Wrong?</h1>
			<p style="font-size: 20px;">Get it touch</p>
			<form action="boxes.php" target="_blank" id="problem" onsubmit="jQuery(this).bettersubmit(); return false;">
				<label for="name">Your Name</label><input type="text" required placeholder="Your Name" title="Your Name" name="name" id="name">
				<label for="email">Your Email</label><input type="email" required placeholder="Your Email" title="Your Email" name="email" id="email">
				<label for="data">Your Comments</label>
				<textarea placeholder="Your Comments" name="data"></textarea>
				<input type="hidden" value='' name="box">
				<input type="hidden" value='' name="field">
				<input type="hidden" value='yes' name="problem">
				<input type="submit" value="Send">
			</form>
		</div>
	</div>
    <div id="map_container"> 
		<div id="map_canvas"></div> 
	</div>
	<div id="interface"> 
		<div id="form"> 
			<form id="search">
				<input placeholder="Click to find ballot drops by Address, City, Zip, or County" type="text" name="address" id="address" >
				<input type="submit" value="Go!" id="search">
				<span style="float: right;color: white;font-size: 10px;margin: -17px 0px 0 0; text-transform: uppercase;">brought to you by</span><a href="http://busfoundation.org/" style="float: right;" target="_blank"><img src="logoc3.png" alt="The Bus Project Foundation" ></a>
			</form>
		</div> 
	</div>
</body>
 
</html>