const needleCanvas = document.getElementById('needleCanvas');
    const ctx = needleCanvas.getContext('2d');
    const centerX = needleCanvas.width / 2;
    const centerY = needleCanvas.height - 40;
    const radius = 150;
    let angle = 0;
    let direction = 1;
    let stopped = false;
    let animationFrame;

    let currentPlayer = 1;
    let results = [];
    let turnComplete = false;

    const hammer = document.getElementById('hammer');
    const fillBar = document.getElementById('fillBar');
    const meterCanvas = document.getElementById('meterCanvas');
    const meterCtx = meterCanvas.getContext('2d');
    const bgImg = new Image();
    bgImg.src = 'strength_meter.png';
    bgImg.onload = () => {
      meterCtx.drawImage(bgImg, 0, 0, meterCanvas.width, meterCanvas.height);
    };

    function drawNeedle(currentAngle) {
      ctx.clearRect(0, 0, needleCanvas.width, needleCanvas.height);
      const rad = (Math.PI / 180) * currentAngle;
      const x = centerX + radius * Math.cos(rad);
      const y = centerY - radius * Math.sin(rad);

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = "white";
      ctx.lineWidth = 5;
      ctx.stroke();
    }

    function swingNeedle() {
      if (stopped) return;
      const speed = 1 + 2 * Math.abs(Math.sin((Math.PI * angle) / 180));
      angle += direction * speed;

      if (angle >= 180 || angle <= 0) {
        direction *= -1;
        angle = Math.max(0, Math.min(180, angle));
      }

      drawNeedle(angle);
      animationFrame = requestAnimationFrame(swingNeedle);
    }

    function stopSwing() {
      if (stopped) return;
      stopped = true;
      cancelAnimationFrame(animationFrame);

      const score = Math.max(0, 100 - Math.abs(90 - angle).toFixed(0));
      document.getElementById('score').innerText = `Player ${currentPlayer}: Stopped at ${angle.toFixed(1)}° — Score: ${score}`;

      hammer.style.opacity = 1;
      hammer.style.transform = 'translateY(-50px)';
      setTimeout(() => {
        hammer.style.transform = 'translateY(0)';
      }, 100);

      fillBar.style.height = `${score}%`;

      results.push({ player: currentPlayer, angle: angle.toFixed(1), score });
      updateResultsTable();

      if (currentPlayer === 1) {
        currentPlayer = 2;
        setTimeout(() => {
          replay(false);
          document.getElementById('score').innerText = 'Player 2: Stop to test your strength';
        }, 1000);
      } else {
        currentPlayer = 1;
        setTimeout(() => {
          const p1 = results[results.length - 2];
          const p2 = results[results.length - 1];
          const winner = p1.score > p2.score ? 'Player 1' : p1.score < p2.score ? 'Player 2' : 'It\'s a tie';
          document.getElementById('score').innerText = `Game Over! Winner: ${winner}. Press Replay to compete again.`;
          drawNeedle(0);
        }, 2000);
      }
    }

    function updateResultsTable() {
      const table = document.getElementById('resultsTable');
      table.innerHTML = results.map(r => `<tr><td>${r.player}</td><td>${r.angle}°</td><td>${r.score}</td></tr>`).join('');
    }

    function replay(clearTable = true) {
      stopped = false;
      angle = 0;
      direction = 1;
      drawNeedle(0);
      swingNeedle();
      hammer.style.opacity = 0;
      fillBar.style.height = '0%';
      if (clearTable) {
        results = [];
        updateResultsTable();
      }
      document.getElementById('score').innerText = 'Player 1: Stop to test your strength';
    }

    function start() {
      swingNeedle();
    }