<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use GuzzleHttp\Promise;

$app->post('/run', function (Request $request, Response $response, $args) {
    try{
      $db = new database();
      $db = $db->connect();
      $sql_query = "Update users set active='F' where TIMEDIFF(NOW(),logintime)>='01:00:00';";
      $statement = $db->query($sql_query);
      $sql_query = "Select accesstoken,refreshtoken,active from users where username ='".$_GET['user']."';";
      $statement = $db->query($sql_query);
      $user = $statement->fetchAll(PDO::FETCH_OBJ);
      $user = json_decode(json_encode($user[0]), true);
      $access_token = $user["accesstoken"];

      if($user["active"]=="F"){
        $refresh_token = $user["refreshtoken"];

        //refreshtokenfirst
        $params = array(
                  'grant_type'=>'refresh_token',
                  'refresh_token'=>$refresh_token,
                  'client_id'=>$_SESSION['client_info']['client_id'],
                  'client_secret'=>$_SESSION['client_info']['client_secret']
                 );
       $Rresponse = $_SESSION['guzzle']->request('POST','/oauth/token',['form_params'=>$params]);
       if($Rresponse->getStatusCode()!=200)
           {throw new Exception("failed");}

       $body = $Rresponse->getBody();
       $res = json_decode($body,true);
       $result = $res['result']['data'];
       $access_token = $result['access_token'];
       $refresh_token = $result['refresh_token'];
       $sql_str = "Update users set accesstoken = '".$access_token."',refreshtoken = '".$refresh_token."',logintime = NOW(),active = 'T' where username = '".$_GET['user']."';";
       $db->query($sql_str);
      }

      $params = $request->getParsedBody();
      //echo json_encode($params);
      $Rresponse = $_SESSION['guzzle']->request('POST','/ide/run',[
                    'form_params'=>$params,
                    'headers'=>array('Content-Type'=>'application/x-www-form-urlencoded','Authorization'=>'Bearer '.$access_token)
      ]);
      if($Rresponse->getStatusCode()!=200)
          {throw new Exception("failed");}
      $body = $Rresponse->getBody();
      $link = json_decode($body,true)['result']['data']['link'];
      $output = "";
      $error = "";
      $time = 0;
      $res = null;
      while($time<=40&&$output==""&&$error==""){
            sleep (5);
            $time = $time + 5;
            $Rresponse = $_SESSION['guzzle']->request('GET','ide/status?link='.$link,[
                           'headers'=>array('Authorization'=>'Bearer '.$access_token)
             ]);
            if($Rresponse->getStatusCode()!=200)
                {throw new Exception("failed");}
            $body = $Rresponse->getBody();
            $res = json_decode($body,true);
            $output = $res['result']['data']['output'];
            $error = $res['result']['data']['cmpinfo'];
      }
      $response->getBody()->write(json_encode($res));

    }
    catch(Exception $e){
         // $response->getBody()->write(json_encode($e->getMessage()));
           $response->getBody()->write(json_encode(array("status"=>"error","data"=>["message"=>"server error"])));
    }
    //
    return $response->withHeader('Content-Type', 'application/json');
});
