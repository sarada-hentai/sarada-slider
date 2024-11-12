<script>
    document.addEventListener('DOMContentLoaded', () => {
        const sliderId = 'sarada-video-slider';
        const closeBtnId = 'sarada-close-btn';
        const videoId = 'sarada-video';
        const slider = document.getElementById(sliderId);
        const closeButton = document.getElementById(closeBtnId);
        const video = document.getElementById(videoId);

        const AD_HIDE_DURATION = 60000; // 1 minute in milliseconds
        const HIDE_KEY = 'adSliderLastHidden';

        // Helper function to set a cookie
        function setCookie(name, value, minutes) {
            const date = new Date();
            date.setTime(date.getTime() + (minutes * 60 * 1000));
            document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
        }

        // Helper function to get a cookie
        function getCookie(name) {
            const cookies = `; ${document.cookie}`;
            const parts = cookies.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
            return null;
        }

        function ensureAutoplay(retries = 3) {
            video.muted = true;
            video.playsInline = true;

            const attemptPlay = () => {
                video.play().catch(error => {
                    if (retries > 0) {
                        retries--;
                        console.warn("Autoplay failed, retrying...", retries, "retries left.");
                        setTimeout(attemptPlay, 500);
                    } else {
                        console.error("Autoplay failed after multiple attempts:", error);
                    }
                });
            };

            attemptPlay();
        }

        function restartVideoAndAd() {
            video.muted = true;
            video.currentTime = 0;
            ensureAutoplay();
        }

        video.addEventListener('pause', () => {
            if (slider.classList.contains('sarada-fade-in')) {
                ensureAutoplay();
            }
        });

        video.addEventListener('volumechange', () => {
            if (!video.muted) {
                video.muted = true;
            }
        });

        const myFP = fluidPlayer(videoId, {
            layoutControls: {
                autoHide: true,
                autoPlay: true,
                loop: false,
                mute: true,
                primaryColor: "#a10606",
                playPauseAnimation: false,
                playButtonShowing: false,
                fillToContainer: true
            },
            vastOptions: {
                adList: [{
                    roll: "preRoll",
                    vastTag: "https://s.magsrv.com/v1/vast.php?idzone=5459954",
                    adText: ""
                }],
                adCTAText: false,
                adCTATextPosition: ""
            }
        });

        function showVastAd() {
            slider.style.visibility = 'hidden';
            slider.style.opacity = '0';

            setTimeout(() => {
                slider.classList.add('sarada-fade-in');
                slider.style.visibility = 'visible';
                slider.style.opacity = '1';
                restartVideoAndAd();
                myFP.loadVASTAd();
            }, 1000);
        }

        function hideAdSliderTemporarily() {
            const currentTime = Date.now();
            localStorage.setItem(HIDE_KEY, currentTime); // Save in localStorage
            setCookie(HIDE_KEY, currentTime, 1); // Save in cookie for 1 minute
            slider.classList.remove('sarada-fade-in');
            slider.style.opacity = '0';
            slider.style.visibility = 'hidden';
            video.pause();
        }

        function getLastHiddenTime() {
            // Check localStorage first
            const localStorageTime = parseInt(localStorage.getItem(HIDE_KEY), 10);
            if (localStorageTime) return localStorageTime;

            // Fallback to cookie if localStorage is unavailable
            const cookieTime = parseInt(getCookie(HIDE_KEY), 10);
            return cookieTime || 0;
        }

        function shouldShowAd() {
            const lastHiddenTime = getLastHiddenTime();
            const timeSinceLastHidden = Date.now() - lastHiddenTime;
            return timeSinceLastHidden > AD_HIDE_DURATION;
        }

        function closeVideoSlider() {
            hideAdSliderTemporarily();
        }

        closeButton.addEventListener('click', closeVideoSlider);
        video.addEventListener('ended', closeVideoSlider);

        window.addEventListener('load', () => {
            if (shouldShowAd()) {
                showVastAd();
            }
        });
    });
</script>
