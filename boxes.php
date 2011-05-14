<?php 
//File for retrieving and storing JSON data in a csv file

$row = 0;

header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Content-type: application/json');


$boxes = array();
$raw = array();

// Opens the csv file and converts location data into nested array
if (($handle = fopen("ballots.csv", "r")) !== FALSE) {
	while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
		$n = 0;
		// Saves all data into two arrays, $raw is used to resave the data if there's a request
		$raw = array_merge($raw,array($data));
		if( $row == 0 ) $field_names = $data;
		else foreach($data as $v):
			//Converting location data into nested array
			$boxes[$row]['box'] = $row;
			if(strlen($v) > 0):
				if( (int)substr($field_names[$n],0,1) > 0 ) $boxes[$row]["locations"][substr($field_names[$n],0,1)-1][substr($field_names[$n],4)] = $v;
				else $boxes[$row][$field_names[$n]] = $v;
			endif;
			$n++;
		endforeach;
		$row++;
	}
	fclose($handle);
}

// Will save the data if there's a request
if( isset($_GET['box']) && isset($_GET['field']) ) {

	if( isset($_GET['problem']) ) { 
		$subject = 'Problem on Drop Ballot';
		$headers = 'From:' .$_GET['email']. "\r\n" .
		'Reply-To: '.$_GET['email']. "\r\n" .
		'X-Mailer: PHP/' . phpversion();
		$msg = "From:\t".$_GET['name']." (".$_GET['email'].")  ".$_SERVER['REMOTE_ADDR'];
		if( strlen($_GET['box']) > 0 ) {
			$subject .= ' for Box '.$_GET['box'];
			$msg .= "\n\nBox:\t".$_GET['box'];
		}
		$msg .= "\n\nNote:\t".$_GET['data'];
		$msg .= "\n\nBrowser:\t".$_GET['browser'];
		$msg .= "\n\nOn:\t".date(DATE_ISO8601);
		mail('srduncombe@gmail.com', $subject, $msg, $headers );
	} 

	$col = array_search($_GET['field'],$field_names);
	// if the requested field exists, will append the data to a new line with IP Addres + Date/Time
	if( isset($raw[$_GET['box']][$col]) ) {

		$raw[$_GET['box']][$col] = trim($raw[$_GET['box']][$col]."\n-'".$_GET['data']."' on ".date(DATE_ISO8601).' by '.$_SERVER['REMOTE_ADDR']);

		if( ($fp = fopen("ballots.csv", "w")) !== FALSE ){
			foreach ($raw as $fields) {
				fputcsv($fp, $fields);
			}
			fclose($fp);
			echo json_encode(array('success'=>true));
		} else json_encode(array('success'=>false));

	} else json_encode(array('success'=>false));

} else  {
	$json = '[';
	foreach( $boxes as $box ) {
		$json .= "\n".json_encode($box).',';
	}
	echo substr($json,0,-1).']';
}


?>