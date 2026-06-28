    let userScore =0;
    let compScore=0;

    const msg = document.querySelector(".msg");
    const choices  = document.querySelectorAll(".choice");

    const showWinner = (userWin) => {
        if(userWin){
            console.log("You Win!");
            msg.innerText = "You Win!"
        }
        else{
            console.log("You lose!")
            msg.innerText = "You lose!";
        }
    }
    const drawGame = () => {
        console.log("Game was draw");
        msg.innerText = "Game Draw";
    }
    const genCompChoice = () => {
        //rock, paper, scissor
        const options = ["rock", "paper", "scissor"];
        const randIdx = Math.floor(Math.random() * 3);
        return options[randIdx];
    }
    let userWin = true;
    const playgame = (userChoice)=>{
        console.log("user choice = ",userChoice);
        //computer choice
        const compChoice = genCompChoice();
        console.log("bot choice = ",compChoice);
        if(userChoice === compChoice){
            drawGame();
        }
        else{
            if(userChoice === "rock"){
                // scissors , // paper
                userWin = compChoice === "paper" ? false : true;
            } else if(userChoice === "paper"){
                userWin = compChoice === "scissor" ? false : true;
            }
            else{
                userWin = compChoice === "rock" ? false : true;
            }
            showWinner(userWin);
        }
        ;
    };
    choices.forEach((choice)=>{
        console.log("choice");
        choice.addEventListener("click",()=>{
            const userChoice = choice.getAttribute("id");
            playgame(userChoice);
        });
    });