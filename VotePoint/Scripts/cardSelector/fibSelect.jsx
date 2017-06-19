const FibCard = function (props) {
    let cost = props.num;
    function castFib() {
        castVote(cost);
    }
    return (
        <div className='selectable-card-row'>
            <div className='selectable-card' onClick={castFib}>
                {props.num}
            </div>
        </div>
    );
}
const FibList = function (props) {
    var count = parseInt(props.count);
    var fib = [1, 2];
    while (count > 2){
        count -= 1;
        let nextNum = fib[fib.length - 1] + fib[fib.length - 2];
        fib.push(nextNum);
    }
    return (
        <div>
            {fib.map(num => <FibCard num={num} />)}
        </div>
    );
}

function renderFibSelector() {
    ReactDOM.render(<FibList count='12' />, document.getElementById("card-selection-stage"));
}