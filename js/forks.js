(function() {

  // The Fork Class
  // We'll have lots of forks.
  // Each fork will be on object of this
  // constructor.

  mit.Fork = function() {
    // Handle x/y
    this.x = 0;
    this.y = 0;

    // W/H
    this.w = 0;
    this.h = 0;


    // Head x/y
    this.head_x = 0;
    this.head_y = 0;

    // Head W/H
    this.head_w = 0;
    this.head_h = 0;

    // Edge on which the fork will stand on
    this.edge = 'btm';

    // Get Handle Bounds
    this.getHandleBounds =  function() {
      var bounds = {};

      bounds.start_x = this.x;
      bounds.start_y = this.y;
      bounds.end_x = this.x + this.w;
      bounds.end_y = this.y + this.h;

      //console.log(bounds);
      return bounds;
    };

    // Get Head Bounds
    this.getHeadBounds = function() {
      var bounds = {};

      bounds.start_x = this.head_x;
      bounds.start_y = this.head_y;
      bounds.end_x = this.head_x + this.head_w;
      bounds.end_y = this.head_y + this.head_h;

      return bounds;
    };
  };


  // A ForkUtils class to help save the world

  mit.ForkUtils = {

    // Master array of all existing forks in memory
    forks: [],
    // Forks can be placed on top/bottom edges
    edges: ['top', 'btm'],

    // Images for fork handle, fork head and the digged part
    fork_img: {},
    fork_head_img: {},
    dig_img: {},

    // How many forks to have in memory ?
    count: 6,

    init: function() {
      // Loading Images

      // Fork handle
      this.fork_img = new Image();
      this.fork_img.src = 'img/fork_handle.png';

      // Fork Head
      this.fork_head_img = new Image();
      this.fork_head_img.src = 'img/fork_head.png';

      // Dig Image
      this.dig_img = new Image();
      this.dig_img.src = 'img/dig.png';
    },

    /*
      How do we go about positioning forks exactly ?

      - Forks can appear on top or bottom edge.
      - Forks should vary in sizes, but should be
        mostly long to produce a harder gameplay.
      - Forks should appear at random distance.
        But there needs to be a range (or capping).
      - Every fork object should know what edge it
        is put on. This will help us calculate the
        exact height based on entire canvas
        height/width.
        This means, we only need the x/y position
        along with the edge, to put on the fork.
    */

    /*
      This method will generate a random x/y
      position for the forks to start at.

      Based on the `fork.edge` we can draw
      the fork easily on the canvas edges.
    */

    getRandomForkPos: function() {
      // We have access to `forks` here
      var pos = {};

      if (this.forks[this.forks.length-1]) {
        pos.x = this.forks[this.forks.length-1].x;
        pos.x += utils.randomNumber(300,600);
      }
      else {
        pos.x = mit.W/1000 * 800;
      }

      var branches = mit.BranchUtils.branches;
      /*var last_branch = [branches.length-1];

      if (last_branch) {
        if (Math.abs(pos.x - last_branch.x) < 300)
          pos.x = last_branch.x + 300;
      }*/

      if (branches.length) {
        branches.forEach(function(branch) {
          if (Math.abs(pos.x - branch.x) < 300)
            pos.x = branch.x + 300;
        });
      }

      return pos;
    },

    create: function() {
      var fork_img = this.fork_img,
          dig_img = this.dig_img,
          fork_head_img = this.fork_head_img,
          forks = this.forks,
          count = this.count;

      if (forks.length < count) {

        for (var i = 0; i < count - forks.length; i++) {
          var fork = new mit.Fork();

          // Setting a Random Edge
          fork.edge = this.edges[utils.randomNumber(0,1)];

          // Setting the Dig Position
          if (fork.edge === 'btm') {
            var dig_rand = utils.randomNumber(3,5);

            fork.dig_x = dig_img.width / dig_rand;
            fork.dig_y = mit.H - dig_img.height;
            // console.log(this.dig_img.width);

            fork.y = 200 + utils.randomNumber(0,100);
            fork.y += fork_head_img.height;
          }

          if (fork.edge === 'top') {
            fork.y = 0 - utils.randomNumber(0,100);
            fork.y -= fork_head_img.height;
          }

          var pos = this.getRandomForkPos();
          fork.x = pos.x;

          // Height and Width
          fork.w = fork_img.width;
          fork.h = fork_img.height;

          forks.push(fork);
        }

      }
    },

    draw: function(ctx) {
      var fork_img = this.fork_img,
          dig_img = this.dig_img,
          fork_head_img = this.fork_head_img,
          forks = this.forks;

      this.create();

      // Loop over forks and draw each of them
      forks.forEach(function(fork, index) {

        if (fork.x < 0) {
          forks.splice(index, 1);
        }

        fork.x -= mit.Backgrounds.ground_bg_move_speed;

        if (fork.edge === 'top') {
          // ctx.lineTo(fork.x, 0);

          // Top forks need flippin
          ctx.save();
          ctx.translate(fork.x, fork.y);
          ctx.translate(fork_img.width/2, fork_img.height/2);
          ctx.rotate( utils.toRadian(180) );
          ctx.drawImage(fork_img, -fork_img.width/2, -fork_img.height/2);
          ctx.restore();


          fork.head_x = fork.x-fork_head_img.width/8;
          fork.head_y = fork.y+fork_img.height;

          fork.head_w = fork_head_img.width;
          fork.head_h = fork_head_img.height;

          // Draw Fork Head
          ctx.save();
          ctx.translate(fork.head_x, fork.head_y);
          ctx.translate(fork_head_img.width/2, fork_head_img.height/2);
          ctx.rotate( utils.toRadian(180) );
          ctx.drawImage(fork_head_img, -fork_head_img.width/2, -fork_head_img.height/2);
          ctx.restore();
        }
        else if (fork.edge === 'btm') {

          ctx.drawImage(fork_img, fork.x, fork.y);

          fork.head_x = fork.x-fork_head_img.width/5;
          fork.head_y = fork.y-fork_head_img.height;

          fork.head_w = fork_head_img.width;
          fork.head_h = fork_head_img.height;

          // Draw Fork Head
          ctx.save();
          ctx.translate(fork.head_x, fork.head_y);
          ctx.translate(1* fork_head_img.width/2, 1* fork_head_img.height/2);
          ctx.scale(-1,1);
          ctx.drawImage(
            fork_head_img,
            1* -fork_head_img.width/2,
            1* -fork_head_img.height/2
          );
          ctx.restore();
        }

      });
    },

    // Forks have black digs in grounds
    // This function will draw those
    drawDigs: function(ctx) {
      // Loop over forks and draw digs for each of them
      var dig_img = this.dig_img;

      this.forks.forEach(function(fork, index) {

        if (fork.edge === 'btm') {
          ctx.drawImage(dig_img, fork.x - fork.dig_x, fork.dig_y);
        }

      });
    },

    // Check Fork Collision
    checkCollision: function() {
      var first_fork = this.forks[0],
          // Get Pappu Bounds
          pappu_bounds = mit.Pappu.getBounds(),
          // Get Nearest Fork's Handle's Bounds
          fork_bounds = first_fork.getHandleBounds();

      // Check whether pappu collided with the
      // fork handle or not.
      if (utils.intersect(pappu_bounds, fork_bounds)) {
        // console.log(pappu_bounds, fork_bounds);
        mit.gameOver();
      }

      // We'll have to check for collision with fork heads.
      // If there's a collision pappu will be pushed!
      var fork_head_bounds = first_fork.getHeadBounds();

      // Check whether pappu collided with the
      // fork head or not. With fork heads
      // collision detection checks would be
      // a little casual than super stern.

      // if (utils.intersect(pappu_bounds, fork_head_bounds)) {

      if (
        pappu_bounds.end_x      >  fork_head_bounds.start_x+20 &&
        fork_head_bounds.end_x-20  >  pappu_bounds.start_x &&
        pappu_bounds.end_y      >  fork_head_bounds.start_y+20 &&
        fork_head_bounds.end_y-20  >  pappu_bounds.start_y
      ) {
        mit.gameOver();
      }
    }

  };

  mit.ForkUtils.init();

}());
