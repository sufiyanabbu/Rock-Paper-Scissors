    let userScore =0;
    let compScore=0;

    const userScorePara = document.querySelector("#user-score");
    const compScorePara = document.querySelector("#bot-score");

    const msg = document.querySelector(".msg");
    const choices  = document.querySelectorAll(".choice");

    const showWinner = (userWin) => {
        if(userWin){
            userScore++;
            userScorePara.innerText = userScore;
            msg.innerText = "You Win!"
            msg.style.backgroundColor = "green";
        }
        else{
            compScore++;
            compScorePara.innerText = userScore;
            msg.innerText = "You lose!";
            msg.style.backgroundColor = "red";
        }
    }
    const drawGame = () => {
        msg.innerText = "Game Draw";
        msg.style.backgroundColor = "gray"
    }
    const genCompChoice = () => {
        //rock, paper, scissor
        const options = ["rock", "paper", "scissor"];
        const randIdx = Math.floor(Math.random() * 3);
        return options[randIdx];
    }
    let userWin = true;
    const playgame = (userChoice)=>{
        //computer choice
        const compChoice = genCompChoice();
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