$(document).ready(_init);

/* Globals (State variables) */
var link1Length, link2Length;

var cur;

var newX, newY;

var sol1, sol2;

var limits;

/*References to the links*/
var $firstLink, $secondLink;

var $playground;

/* State variable references */
var $link1Length, $link2Length, $joint1Input, $joint2Input, $endX, $endY, $sol1, $sol2;

/* Modal references*/
var $message;

function _init() {
    $playground = $("#playground");

    $message = $(".message");

    // Get references to the link.
    $firstLink = $("#link-1");
    $secondLink = $("#link-2");
    
    var $controls = $("#controls");
    $link1Length = $controls.find("#link-1-length");
    $link2Length = $controls.find("#link-2-length");
    $joint1Input = $controls.find("#joint-1-value");
    $joint2Input = $controls.find("#joint-2-value");
    $endX = $controls.find("#x-value");
    $endY = $controls.find("#y-value");
    $sol1 = $controls.find("#sol-1");
    $sol2 = $controls.find("#sol-2");

    // set state parameters
    link1Length = 200;
    link2Length = 200;

    cur = {
        link1Length,
        link2Length,
        theta1: 0,
        theta2: 0,
        x: 400,
        y: 0
    };

    sol1 = {
        theta1: NaN,
        theta2: NaN
    };

    sol2 = {
        theta1: NaN,
        theta2: NaN
    };

    // limits = {
    //     first: {
    //         min: _toRadians(0),
    //         max: _toRadians(90)
    //     },
    //     second: {
    //         min: _toRadians(-1000),
    //         max: _toRadians(1000)
    //     }
    // };

    $link1Length.text(link1Length);
    $link2Length.text(link2Length);
    $joint1Input.val(0);
    $joint2Input.val(0);
    $endX.val(400);
    $endY.val(0);

    _bindEventHandlers();
}

function findJointAngles(x, y) {
    var slope = Math.atan2(y, x);

    // Euclidean distance to point (x, y)
    var dist = x*x + y*y; 

    /* Finding sol1 */
    var theta1, theta2, s2, c2;

    c2 = (link1Length*link1Length + link2Length*link2Length - dist)/(2*link1Length*link2Length);
    s2 = Math.sqrt(1 - c2*c2);

    theta2 = Math.atan2(s2, c2);
    sol1.theta2 = Math.PI - theta2;

    var ctmp = (dist + link1Length*link1Length - link2Length*link2Length)/(2*link1Length*Math.sqrt(dist));
    sol1.theta1 = slope - Math.acos(ctmp);

    var canDo = false;

    if(_isValid(sol1)) {
        $sol1.attr("disabled", false);
        newX = x;
        newY = y;
        canDo = true;
    }
    else {
        $sol1.attr("disabled", true);
        console.log("Solution 1: Not Reachable");
    }

    /* Finding sol2 */
    sol2.theta2 = theta2 - Math.PI;
    sol2.theta1 = slope + Math.acos(ctmp);
    
    if(_isValid(sol2)) {
        $sol2.attr("disabled", false);
        canDo = true;
    }
    else {
        $sol2.attr("disabled", true);
        console.log("Solution 2: Not Reachable");
    }

    if(canDo) {
        _showMessage("Inverse Kinematics result generated.");
    }
    else {
        _showMessage("Not Reachable");
    }
}

function _bindEventHandlers() {
    $joint1Input.on("change", function(e) {
        var val = $(this).val();
        TweenMax.to($firstLink, 0.25, {
            rotation: val
        });
        cur.theta1 = parseFloat($(this).val());
        _getXY();
        _hideMessage();
        $sol1.attr("disabled", true);
        $sol2.attr("disabled", true);
    });     

    $joint2Input.on("change", function(e) {
        var val = $(this).val();
        TweenMax.to($secondLink, 0.25, {
            rotation: val
        });
        cur.theta2 = parseFloat($(this).val());
        _getXY();
        _hideMessage();
        $sol1.attr("disabled", true);
        $sol2.attr("disabled", true);
    });

    $endX.on("change", function(e) {
        var val = $(this).val();
        $sol1.attr("disabled", true);
        $sol2.attr("disabled", true);
        _hideMessage();
        findJointAngles(val, cur.y);
    });     

    $endY.on("change", function(e) {
        var val = $(this).val();
        $sol1.attr("disabled", true);
        $sol2.attr("disabled", true);
        _hideMessage();
        findJointAngles(cur.x, val);
    });

    $sol1.on("click", function(e) {
        _renderJointChange(sol1);
        _updateCur(sol1);
    });

    $sol2.on("click", function(e) {
        _renderJointChange(sol2);
        _updateCur(sol2);
    })

    $playground.on("click", function(e) {
        // The point of click.
        var x, y;
        x = e.offsetX;
        y = e.offsetY;
        console.log(e.offsetX, e.offsetY);
        findJointAngles(e.offsetX - 5, e.offsetY - 5);
    });
}

function _updateCur(sol) {
    cur.x = newX;
    cur.y = newY;
    if(sol) {
        cur.theta1 = _toDegrees(sol.theta1);
        cur.theta2 = _toDegrees(sol.theta2);
    }
    _updateControls();
}

function _updateControls() {
    $joint1Input.val(cur.theta1);
    $joint2Input.val(cur.theta2);
    $endX.val(cur.x);
    $endY.val(cur.y);
}

function _getXY() {
    console.log(cur.theta1, cur.theta2);
    newX = link1Length*Math.cos(_toRadians(cur.theta1)) + 
            link2Length*Math.cos(_toRadians(cur.theta1 + cur.theta2));
    newY = link1Length*Math.sin(_toRadians(cur.theta1)) + 
            link2Length*Math.sin(_toRadians(cur.theta1 + cur.theta2));
    _updateCur();
}

function _renderJointChange(sol) {
    TweenMax.to($firstLink, 1, {
        rotation: _toDegrees(sol.theta1)
    });
    TweenMax.to($secondLink, 1, {
        rotation: _toDegrees(sol.theta2)
    });
}

/* Utility helper function*/
function _toDegrees(rad) {
    return ((rad*180)/Math.PI);
}

function _toRadians(deg) {
    return ((deg*Math.PI)/180);
}

function _isValid(sol) {
    if(isNaN(sol.theta1) || isNaN(sol.theta2)) {
        return false;
    }

    console.log(_toDegrees(sol.theta1), _toDegrees(sol.theta2));
    if(limits) {
        if(limits.first && !(sol.theta1 >= limits.first.min && sol.theta1 <= limits.first.max)) {
            console.warn("Joint angle 1, out of limits");
            return false;
        }

        if(limits.second && !(sol.theta2 >= limits.second.min && sol.theta2 <= limits.second.max)) {
            console.warn("Joint angle 2, out of limits");
            return false; 
        }
    }

    return true;
}

function _showMessage(message) {
    $message.text(message);
}

function _hideMessage() {
    $message.text("");
}
