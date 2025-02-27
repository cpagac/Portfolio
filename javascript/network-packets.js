/**
 * Network Packet Stream Animation
 * Creates a canvas animation of data packets streaming from left to right
 * Author: Coleman Pagac
 */

(function() {
    // Run when the document is fully loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Find the hero section
      const heroSection = document.querySelector('.hero');
      if (!heroSection) {
        console.warn('Network packet animation: Hero section not found');
        return;
      }
      
      // Create canvas element
      const canvas = document.createElement('canvas');
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '0';
      
      // Set initial opacity based on current theme
      const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
      canvas.style.opacity = isDarkMode ? '0.3' : '0.15';
      
      // Add the canvas to the hero section
      heroSection.style.position = 'relative'; // Ensure hero has relative positioning
      heroSection.insertBefore(canvas, heroSection.firstChild); // Add as first child so it's below content
      
      // Set canvas dimensions based on hero section
      let width = heroSection.offsetWidth;
      let height = heroSection.offsetHeight;
      canvas.width = width;
      canvas.height = height;
      
      // Initialize context
      const ctx = canvas.getContext('2d');
      
      // Create a new packet (for ongoing animation)
      function createPacket(startPosition = 'offscreen') {
        const size = Math.random() * 30 + 10; // Random size between 10-40px
        const speed = Math.random() * 2 + 1.2; // Slightly faster minimum speed (1.2-3.2)
        const y = Math.random() * height; // Random vertical position
        
        // Determine starting x position
        let x;
        if (startPosition === 'offscreen') {
          x = -size; // Start off-screen to the left (original behavior)
        } else {
          x = Math.random() * width; // Random position across the screen width
        }
        
        return {
          x,
          y,
          width: size * (Math.random() * 2 + 1), // Make width 1-3x the size
          height: size / (Math.random() * 3 + 2), // Make height a fraction of size
          speed,
          opacity: Math.random() * 0.5 + 0.1, // Random opacity between 0.1-0.6
          color: getRandomPacketColor(),
          pulseDirection: Math.random() > 0.5 ? 1 : -1, // Direction of opacity pulse
          pulseSpeed: Math.random() * 0.02 + 0.005, // Speed of opacity pulse
          tailLength: Math.floor(Math.random() * 3) + 1, // Number of trailing elements
          ip: generateRandomIP('ipv4'), // IPv4 only
          dataType: Math.random() > 0.7 ? 'binary' : 'none', // 30% chance to show binary data
          binaryData: Math.random() > 0.5 ? '01' : '10' // Simple binary representation
        };
      }
      
      // Initialize packets - many already on screen, some offscreen
      let packets = [];
      
      // Create initial packets distributed across the screen
      // Increased from 25 to 50 for much higher initial density
      for (let i = 0; i < 50; i++) {
        // Distribute about 85% of packets across the screen, 15% off-screen
        const startPosition = i < 42 ? 'onscreen' : 'offscreen';
        packets.push(createPacket(startPosition));
      }
      
      // Sort packets by x position to maintain visual flow
      packets.sort((a, b) => a.x - b.x);
      
      let lastPacketTime = 0;
      let animationFrame;
      
      // Animation function
      function animate(timestamp) {
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Add new packets occasionally
        if (timestamp - lastPacketTime > 100) { // Every 100ms
          if (Math.random() < 0.4) { // Increased from 30% to 40% chance to add a new packet
            packets.push(createPacket('offscreen')); // New packets still start offscreen
            lastPacketTime = timestamp;
          }
        }
        
        // Keep the packet count high after initialization
        if (packets.length < 40 && Math.random() < 0.5) {
          packets.push(createPacket('offscreen'));
        }
        
        // Update and draw packets
        packets = packets.filter(packet => {
          // Update position
          packet.x += packet.speed;
          
          // Remove if off screen
          if (packet.x > width) {
            return false;
          }
          
          // Pulse opacity
          packet.opacity += packet.pulseDirection * packet.pulseSpeed;
          if (packet.opacity > 0.6) {
            packet.opacity = 0.6;
            packet.pulseDirection = -1;
          } else if (packet.opacity < 0.1) {
            packet.opacity = 0.1;
            packet.pulseDirection = 1;
          }
          
          // Draw packet
          ctx.save();
          
          // Draw tail elements (getting progressively more transparent)
          for (let i = 0; i < packet.tailLength; i++) {
            const tailX = packet.x - (i + 1) * 10;
            if (tailX < 0) continue;
            
            ctx.fillStyle = packet.color;
            ctx.globalAlpha = packet.opacity / (i + 2); // Decrease opacity for tail elements
            ctx.beginPath();
            
            // Use rounded rectangle with fallback for older browsers
            if (ctx.roundRect) {
              ctx.roundRect(
                tailX, 
                packet.y, 
                packet.width / (i + 1.5), 
                packet.height, 
                4
              );
            } else {
              roundedRect(
                ctx,
                tailX, 
                packet.y, 
                packet.width / (i + 1.5), 
                packet.height, 
                4
              );
            }
            ctx.fill();
          }
          
          // Draw main packet
          ctx.fillStyle = packet.color;
          ctx.globalAlpha = packet.opacity;
          ctx.beginPath();
          
          // Use rounded rectangle with fallback for older browsers
          if (ctx.roundRect) {
            ctx.roundRect(
              packet.x, 
              packet.y, 
              packet.width, 
              packet.height, 
              4
            );
          } else {
            roundedRect(
              ctx,
              packet.x,
              packet.y,
              packet.width,
              packet.height,
              4
            );
          }
          
          // Add glow effect
          ctx.shadowBlur = 10;
          ctx.shadowColor = packet.color;
          ctx.fill();
          
          // Draw IP address on packet if big enough
          if (packet.width > 50 && packet.height > 10) {
            const fontSize = Math.min(packet.height * 0.6, 14);
            ctx.font = `${fontSize}px monospace`;
            ctx.fillStyle = 'white';
            ctx.globalAlpha = packet.opacity + 0.2; // Make text slightly more visible than packet
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Position text in the center of the packet
            const textX = packet.x + packet.width / 2;
            const textY = packet.y + packet.height / 2;
            
            // Draw IP address
            ctx.fillText(packet.ip, textX, textY);
            
            // Draw binary data if enabled and packet is wide enough
            if (packet.dataType === 'binary' && packet.width > 100) {
              // Generate binary pattern
              let binaryPattern = '';
              const length = Math.floor(packet.width / 8);
              for (let i = 0; i < length; i++) {
                binaryPattern += packet.binaryData;
              }
              
              // Draw binary below the IP (if there's room)
              if (packet.height > 22) {
                ctx.font = `${fontSize * 0.8}px monospace`;
                ctx.fillText(binaryPattern, textX, textY + fontSize);
              }
            }
          }
          
          ctx.restore();
          
          return true;
        });
        
        animationFrame = requestAnimationFrame(animate);
      }
      
      // Fallback for roundRect if not supported
      function roundedRect(ctx, x, y, width, height, radius) {
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
      }
      
      // Get a random color for packets
      function getRandomPacketColor() {
        const colors = [
          '#007bff', // Blue
          '#6610f2', // Indigo
          '#00bfff', // Deep sky blue
          '#00c3ff', // Light blue
          '#9747FF'  // Purple
        ];
        return colors[Math.floor(Math.random() * colors.length)];
      }
      
      // Generate a random IPv4 address
      function generateRandomIP() {
        // Generate random octets
        const octet1 = Math.floor(Math.random() * 256);
        const octet2 = Math.floor(Math.random() * 256);
        const octet3 = Math.floor(Math.random() * 256);
        const octet4 = Math.floor(Math.random() * 256);
        
        // Some common patterns
        if (Math.random() < 0.3) {
          // Local IPs
          return `192.168.${octet3 % 256}.${octet4 % 256}`;
        } else if (Math.random() < 0.5) {
          // Class A private network
          return `10.${octet2 % 256}.${octet3 % 256}.${octet4 % 256}`;
        } else if (Math.random() < 0.7) {
          // Class B private network
          return `172.${16 + Math.floor(Math.random() * 16)}.${octet3 % 256}.${octet4 % 256}`;
        } else {
          // Random public IP
          return `${octet1 % 256}.${octet2 % 256}.${octet3 % 256}.${octet4 % 256}`;
        }
      }
      
      // Handle window resize
      function handleResize() {
        width = heroSection.offsetWidth;
        height = heroSection.offsetHeight;
        canvas.width = width;
        canvas.height = height;
      }
      window.addEventListener('resize', handleResize);
      
      // Watch for theme changes
      function updateThemeOpacity() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        canvas.style.opacity = isDark ? '0.3' : '0.15';
      }
      
      // Check for theme toggle button
      const themeToggle = document.getElementById('theme-toggle');
      if (themeToggle) {
        themeToggle.addEventListener('click', function() {
          // Short delay to ensure theme has changed
          setTimeout(updateThemeOpacity, 50);
        });
      }
      
      // Start animation
      animationFrame = requestAnimationFrame(animate);
      
      // Clean up function if needed (page unload or dynamic removal)
      window.cleanupPacketAnimation = function() {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
        window.removeEventListener('resize', handleResize);
        if (canvas.parentNode) {
          canvas.parentNode.removeChild(canvas);
        }
      };
    });
  })();