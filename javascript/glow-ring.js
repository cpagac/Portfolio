(function() {
    // Run when the document is fully loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Add the styles needed for the glow effect
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        .aws-glow-container {
          position: absolute;
          pointer-events: none;
          z-index: -1;
        }
        
        .aws-glow-path-left, .aws-glow-path-right {
          fill: none;
          stroke-width: 10px;
          stroke-linecap: round;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .aws-glow-path-left {
          stroke: url(#aws-gradient-left);
        }
        
        .aws-glow-path-right {
          stroke: url(#aws-gradient-right);
        }
        
        .aws-glow-path-left.active, .aws-glow-path-right.active {
          opacity: 1;
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: dash 1.2s ease-in-out forwards;
        }
        
        .aws-outer-glow {
          position: absolute;
          border-radius: 12px;
          z-index: -2;
          opacity: 0;
          transition: opacity 0.3s ease;
          filter: blur(12px);
        }
        
        
        .aws-outer-glow.dark-mode {
          background: linear-gradient(45deg, rgba(13, 202, 240, 0.6), rgba(151, 71, 255, 0.6), rgba(13, 202, 240, 0.6));
          background-size: 200% 200%;
        }
        
        .aws-outer-glow.active {
          opacity: 1;
          animation: gradient-move 3s ease infinite 1s;
        }
        
        /* Dark mode fill */
        .aws-fill-path {
          fill: url(#aws-gradient-fill);
          opacity: 0;
          transition: opacity 0.3s ease;
          display: none; /* Hidden by default */
        }
        
        /* Only show and animate fill in dark mode */
        .aws-fill-path.dark-mode {
          display: block; /* Show in dark mode */
        }
        
        .aws-fill-path.dark-mode.active {
          opacity: 1;
          animation: fade-in 1s ease-in-out 1s forwards;
        }
        
        @keyframes dash {
          to {
            stroke-dashoffset: 0;
          }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 0.8; }
        }
        
        @keyframes gradient-move {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `;
      document.head.appendChild(styleElement);
      
      // Create SVG gradient definition once
      const svgDefs = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgDefs.style.width = '0';
      svgDefs.style.height = '0';
      svgDefs.style.position = 'absolute';
      svgDefs.innerHTML = `
        <defs>
          <!-- Left gradient that flows from top to bottom -->
          <linearGradient id="aws-gradient-left" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stop-color="#4DB4FA" />
            <stop offset="50%" stop-color="#9747FF" />
            <stop offset="100%" stop-color="#4DB4FA" />
          </linearGradient>
          
          <!-- Right gradient that flows from top to bottom -->
          <linearGradient id="aws-gradient-right" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stop-color="#4DB4FA" />
            <stop offset="50%" stop-color="#9747FF" />
            <stop offset="100%" stop-color="#4DB4FA" />
          </linearGradient>
          
          <!-- Fill gradient for dark mode -->
          <linearGradient id="aws-gradient-fill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#4DB4FA">
              <animate attributeName="offset" values="0;0.3;0" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stop-color="#9747FF">
              <animate attributeName="offset" values="0.5;0.7;0.5" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stop-color="#4DB4FA">
              <animate attributeName="offset" values="1;0.7;1" dur="3s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        </defs>
      `;
      document.body.appendChild(svgDefs);
      
      // Function to check current theme
      function isDarkMode() {
        return document.documentElement.getAttribute('data-theme') === 'dark';
      }
      
      // Get all skill category cards
      const skillCards = document.querySelectorAll('.skill-category');
      const glowContainers = [];
      const outerGlowElements = [];
      
      // Process each card
      skillCards.forEach(card => {
        // Make sure card has relative positioning
        const computedStyle = window.getComputedStyle(card);
        if (computedStyle.position === 'static') {
          card.style.position = 'relative';
        }
        
        // Create SVG container for the glow path
        const svgContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgContainer.classList.add('aws-glow-container');
        
        // Create the left path (counterclockwise from top center)
        const leftPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        leftPath.classList.add('aws-glow-path-left');
        
        // Create the right path (clockwise from top center)
        const rightPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        rightPath.classList.add('aws-glow-path-right');
        
        // Create fill path for dark mode
        const fillPath = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        fillPath.classList.add('aws-fill-path');
        
        // Set initial dark mode class if needed
        if (isDarkMode()) {
          fillPath.classList.add('dark-mode');
        }
        
        // Add paths to SVG container
        svgContainer.appendChild(fillPath);
        svgContainer.appendChild(leftPath);
        svgContainer.appendChild(rightPath);
        document.body.appendChild(svgContainer);
        
        // Create the outer glow element
        const outerGlowElement = document.createElement('div');
        outerGlowElement.className = 'aws-outer-glow';
        updateThemeClass(outerGlowElement);
        document.body.appendChild(outerGlowElement);
        
        glowContainers.push({svg: svgContainer, leftPath, rightPath, fill: fillPath});
        outerGlowElements.push(outerGlowElement);
        
        // Function to update the glow elements' positions and paths
        function updateGlowPosition() {
          const rect = card.getBoundingClientRect();
          const scrollTop = window.scrollY || document.documentElement.scrollTop;
          const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
          
          // Update SVG container position and size
          svgContainer.style.top = (rect.top + scrollTop - 5) + 'px';
          svgContainer.style.left = (rect.left + scrollLeft - 5) + 'px';
          svgContainer.style.width = (rect.width + 10) + 'px';
          svgContainer.style.height = (rect.height + 10) + 'px';
          svgContainer.setAttribute('viewBox', `0 0 ${rect.width + 10} ${rect.height + 10}`);
          
          // Update the fill rectangle for dark mode
          fillPath.setAttribute('x', '5');
          fillPath.setAttribute('y', '5');
          fillPath.setAttribute('width', rect.width);
          fillPath.setAttribute('height', rect.height);
          fillPath.setAttribute('rx', '8');
          
          const pathWidth = rect.width;
          const pathHeight = rect.height;
          
          // Left path: Start at top center, go left and down to bottom center
          const leftPathData = `
            M ${5 + pathWidth/2} 5
            L 5 5
            L 5 ${5 + pathHeight}
            L ${5 + pathWidth/2} ${5 + pathHeight}
          `;
          
          // Right path: Start at top center, go right and down to bottom center
          const rightPathData = `
            M ${5 + pathWidth/2} 5
            L ${5 + pathWidth} 5
            L ${5 + pathWidth} ${5 + pathHeight}
            L ${5 + pathWidth/2} ${5 + pathHeight}
          `;
          
          leftPath.setAttribute('d', leftPathData);
          rightPath.setAttribute('d', rightPathData);
          
          // Position the outer glow element
          outerGlowElement.style.width = (rect.width + 50) + 'px';
          outerGlowElement.style.height = (rect.height + 50) + 'px';
          outerGlowElement.style.top = (rect.top + scrollTop - 25) + 'px';
          outerGlowElement.style.left = (rect.left + scrollLeft - 25) + 'px';
          outerGlowElement.style.borderRadius = '12px';
        }
        
        // Update position initially and on scroll/resize
        updateGlowPosition();
        window.addEventListener('scroll', updateGlowPosition);
        window.addEventListener('resize', updateGlowPosition);
        
        // Add hover events
        card.addEventListener('mouseenter', function() {
          updateGlowPosition(); // Ensure accurate positioning
          updateThemeClass(outerGlowElement);
          
          // Update fill path based on theme
          if (isDarkMode()) {
            fillPath.classList.add('dark-mode');
          } else {
            fillPath.classList.remove('dark-mode');
          }
          
          // Remove and re-add active class to restart animation
          leftPath.classList.remove('active');
          rightPath.classList.remove('active');
          fillPath.classList.remove('active');
          outerGlowElement.classList.remove('active');
          
          // Force a reflow to ensure animation restarts
          void leftPath.offsetWidth;
          void rightPath.offsetWidth;
          void fillPath.offsetWidth;
          void outerGlowElement.offsetWidth;
          
          // Add active class to trigger animation
          leftPath.classList.add('active');
          rightPath.classList.add('active');
          fillPath.classList.add('active');
          outerGlowElement.classList.add('active');
          
          // Also add the lift effect
          const originalTransform = card.style.transform || '';
          card.style.transform = originalTransform + ' translateY(-5px)';
          card.style.transition = 'all 0.3s ease';
          card.style.zIndex = '10';
        });
        
        card.addEventListener('mouseleave', function() {
          leftPath.classList.remove('active');
          rightPath.classList.remove('active');
          fillPath.classList.remove('active');
          outerGlowElement.classList.remove('active');
          
          // Remove the lift effect
          const originalTransform = card.style.transform || '';
          card.style.transform = originalTransform.replace(' translateY(-5px)', '');
          card.style.zIndex = '';
        });
      });
      
      // Function to update theme class based on current theme
      function updateThemeClass(element) {
        if (isDarkMode()) {
          element.classList.remove('light-mode');
          element.classList.add('dark-mode');
        } else {
          element.classList.remove('dark-mode');
          element.classList.add('light-mode');
        }
      }
      
      // Watch for theme changes and update glow elements
      const themeToggle = document.getElementById('theme-toggle');
      if (themeToggle) {
        themeToggle.addEventListener('click', function() {
          // Update all glow elements after a short delay to ensure theme has changed
          setTimeout(() => {
            outerGlowElements.forEach(element => {
              updateThemeClass(element);
            });
            
            glowContainers.forEach(({fill}) => {
              if (isDarkMode()) {
                fill.classList.add('dark-mode');
              } else {
                fill.classList.remove('dark-mode');
              }
            });
          }, 50);
        });
      }
    });
  })();