<?php


class AntiSpam
{

    protected $keyServer;
    protected $keySecret;
    protected $keyToken;
    protected $keyAnswer;

    public function __construct()
    {
        if (session_status() !== PHP_SESSION_ACTIVE) {
            @session_start();
        }
        $this->keyServer = 'marcz@Lab1521.com';
    }

    public function question()
    {
        return $this->generate();
    }

    public function answer($answer, $token)
    {
        return $this->compute(trim($answer), trim($token));
    }

    protected function generate()
    {
        $var1 = rand(1, 9);
        $var2 = rand(1, 9);
        $plus = rand(0, 1) ? 'plus' : 'add';
        $answer = $var1 + $var2;
        $question = "{$var1} {$plus} {$var2}";

        $keyServer = $this->keyServer . sha1(microtime());
        $keySecret = sha1(microtime()) . sha1(microtime());
        $keyToken = crypt($keySecret, sha1($keyServer));

        $_SESSION['AntiSpamServer'] = $keyServer;
        $_SESSION['AntiSpamSecret'] = $keySecret;
        $_SESSION['AntiSpamAnswer'] = $answer;
        $_SESSION['AntiSpamToken'] = $keyToken;

        return array('question' => $question, 'client' => $keyToken);
    }

    protected function compute($answer, $token)
    {
        if ( ! isset($_SESSION['AntiSpamServer'])) {
            return false;
        }
        if ( ! isset($_SESSION['AntiSpamSecret'])) {
            return false;
        }
        if ( ! isset($_SESSION['AntiSpamAnswer'])) {
            return false;
        }
        if ( ! isset($_SESSION['AntiSpamToken'])) {
            return false;
        }

        $keyServer = $_SESSION['AntiSpamServer'];
        $keySecret = $_SESSION['AntiSpamSecret'];
        $keyAnswer = $_SESSION['AntiSpamAnswer'];
        $keyToken = $_SESSION['AntiSpamToken'];

        $this->generate();

        if ((int) $answer !== $keyAnswer) {
            return false;
        }

        if ($token !== $keyToken) {
            return false;
        }

        if ($answer !== (string) $keyAnswer) {
            return false;
        }
        if ($token !== $keyToken) {
            return false;
        }

        return ((crypt($keySecret, sha1($keyServer)) === $token) ? true : false);
    }

}


class FormCheck
{

    protected static $input;

    public static function setSource($source)
    {
        self::$input = $source;
    }

    public static function getInput($name)
    {
        if (isset(self::$input[$name])) {
            $name = self::$input[$name];
        }

        return stripslashes($name);
    }

    public static function email($email)
    {
        $email = self::getInput($email);

        return (preg_match("/^[[:alnum:]][a-z0-9_.-]*@[a-z0-9_.-]+.[a-z]{2,3}$/", $email)) ? $email : null;
    }

    public static function required($field)
    {
        $field = self::getInput($field);

        if (trim($field) == '') {
            return null;
        }

        return $field;
    }

    public static function sanitize($field)
    {
        $field = self::getInput($field);

        return filter_var($field, FILTER_SANITIZE_STRING);
    }
}


class ContactForm
{

    protected $fields = array();
    protected $callbacks = array();
    protected $notices = array();
    protected $success = false;
    protected $source = array();

    public function __construct()
    {
        $this->source = $_GET;
    }

    public function setSource($source)
    {
        $this->source = $source;
    }

    public function sourceInput()
    {
        return $this->source;
    }

    public function setFields($fields)
    {
        $this->fields = array_merge($this->fields, $fields);
    }

    public function setFilter($callback, $fields)
    {
        $this->callbacks[] = array('method' => $callback, 'args' => $fields);
    }

    public function input($name)
    {
        return (isset($this->source[$name])) ? $this->source[$name] : null;
    }

    public function getFields($fieldList = null)
    {
        if (is_array($fieldList)) {
            return array_intersect_key($this->source, array_flip($fieldList));
        }

        return $this->source;
    }

    public function filterField($key, $checkString)
    {
        $filters = explode('|', $checkString);
        FormCheck::setSource($this->sourceInput());

        foreach ($filters as $filter) {
            if ( ! method_exists('FormCheck', $filter)) {
                return false;
            }

            $value = FormCheck::$filter($key);

            if ( ! $value) {
                return false;
            }

            $this->source[$key] = $value;
        }

        return true;
    }

    public function validate()
    {
        $fields = $this->fields;
        foreach ($fields as $key => $checksString) {
            if ( ! $this->filterField($key, $checksString)) {
                $this->notices[] = array($key => $checksString);
            }
        }

        foreach ($this->callbacks as $filters) {
            $filter = $filters['method'];
            $fields = $filters['args'];

            $inputs = $this->getFields($fields);
            if ( ! is_callable($filter, false, $filterName)) {
                $this->notices[] = array('filter' => $filterName . ' is not callable.');
                break;
            }

            if ( ! call_user_func_array($filter, $inputs)) {
                $this->notices[] = array('filter' => $filterName . ' did not passed.');
                foreach ($inputs as $key => $value) {
                    $this->notices[] = array($key => $value);
                }
            }
        }

        if ( ! count($this->notices)) {
            $this->success = true;
        }

        return array('success' => $this->success, 'notices' => $this->notices);
    }


}


class JSON
{

    public static function makeHeaders()
    {
        header("Content-Type: application/json; charset=utf-8");
        header("Expires: on, 01 Jan 1970 00:00:00 GMT");
        header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
        header("Cache-Control: no-store, no-cache, must-revalidate");
        header("Cache-Control: post-check=0, pre-check=0", false);
        header("Pragma: no-cache");
    }

    public static function output($values)
    {
        self::makeHeaders();
        echo json_encode($values);
        exit;
    }
}


class Mailer
{

    public $subject;
    public $email;
    public $message;

    public function to($email)
    {
        $this->email = $email;
    }

    public function subject($subject)
    {
        $this->subject = $subject;
    }

    public function fillTemplate($inputs)
    {
        $template = $this->message;

        foreach ($inputs as $key => $value) {
            $template = str_replace('{{' . $key . '}}', $value, $template);
        }

        $this->message = $template;
    }

    public function setTemplate($template)
    {
        $this->message = $template;
    }

    public function send()
    {
        $headers = 'MIME-Version: 1.0' . "\r\n";
        $headers .= 'Content-type: text/html; charset=iso-8859-1' . "\r\n";
        $headers .= 'From: marcz@lab1521.com' . "\r\n";

        return mail($this->email, $this->subject, $this->message, $headers);
    }

}


$emailTemplate = '<table>
        <tr><th>First Name</th><td>{{nameFirst}}</td></tr>
        <tr><th>Last Name</th><td>{{nameLast}}</td></tr>
        <tr><th>Email</th><td>{{email}}</td></tr>
        <tr><th>Phone</th><td>{{phone}}</td></tr>
        <tr><th>Message</th><td></td></tr>
        <tr><td colspan="2">{{message}}</td></tr>
    </table>
    ';

$antiSpam = new AntiSpam;
$mailer = new Mailer;
$mailer->to('info@patriarch.co.nz');
$mailer->subject('Online Enquiry To VineyardForSale');
$mailer->setTemplate($emailTemplate);

if (isset($_POST['antiSpamAnswer']) && isset($_POST['antiSpamToken'])) {
    $form = new ContactForm;
    $form->setFields(
        array(
            'nameFirst'      => 'required|sanitize',
            'nameLast'       => 'required|sanitize',
            'email'          => 'required|email',
            'phone'          => 'required|sanitize',
            'message'        => 'required|sanitize',
            'antiSpamAnswer' => 'required|sanitize',
            'antiSpamToken'  => 'required|sanitize'
        )
    );

    $form->setSource($_POST);
    $form->setFilter(array($antiSpam, 'answer'), array('antiSpamAnswer', 'antiSpamToken'));

    $validation = $form->validate();

    if ($validation['success']) {
        $mailer->fillTemplate($form->getFields());
        $mailer->send();
    }

    JSON::output($validation);
}

JSON::output($antiSpam->question());