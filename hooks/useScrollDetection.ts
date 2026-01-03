import { useEffect, useState, RefObject } from 'react';

interface ScrollState {
  canScrollUp: boolean;
  canScrollDown: boolean;
  canScrollLeft: boolean;
  canScrollRight: boolean;
}

/**
 * Hook to detect scroll boundaries in a container
 */
export function useScrollDetection(
  ref: RefObject<HTMLElement | null>,
  direction: 'vertical' | 'horizontal' | 'both' = 'both'
): ScrollState {
  const [state, setState] = useState<ScrollState>({
    canScrollUp: false,
    canScrollDown: false,
    canScrollLeft: false,
    canScrollRight: false,
  });

  useEffect(() => {
    const container = ref.current;
    console.log('[useScrollDetection] useEffect triggered', { 
      hasContainer: !!container,
      direction,
      containerHeight: container?.clientHeight,
      containerWidth: container?.clientWidth,
      scrollHeight: container?.scrollHeight
    });
    
    if (!container) {
      console.log('[useScrollDetection] No container found, will retry with polling');
      // Poll for container to become available
      const intervalId = setInterval(() => {
        const retryContainer = ref.current;
        if (retryContainer) {
          console.log('[useScrollDetection] Container found via polling!');
          clearInterval(intervalId);
          // Trigger re-run by forcing a state update (hack but works)
          setupScrollDetection(retryContainer);
        }
      }, 50);
      
      // Also try after a delay
      const timeoutId = setTimeout(() => {
        const retryContainer = ref.current;
        if (retryContainer) {
          console.log('[useScrollDetection] Container found on timeout');
          clearInterval(intervalId);
          setupScrollDetection(retryContainer);
        }
      }, 200);
      
      return () => {
        clearInterval(intervalId);
        clearTimeout(timeoutId);
      };
    }
    
    setupScrollDetection(container);
    
    function setupScrollDetection(container: HTMLElement) {
      console.log('[useScrollDetection] Setting up scroll detection for container', {
        clientHeight: container.clientHeight,
        clientWidth: container.clientWidth,
        scrollHeight: container.scrollHeight
      });

      const checkScroll = () => {
      console.log('[useScrollDetection] checkScroll called');
      
      // Ensure container is still valid and has dimensions
      if (!container || container.clientHeight === 0 || container.clientWidth === 0) {
        console.log('[useScrollDetection] Container has no dimensions', {
          clientHeight: container?.clientHeight,
          clientWidth: container?.clientWidth,
          exists: !!container
        });
        return;
      }

      const newState: ScrollState = {
        canScrollUp: false,
        canScrollDown: false,
        canScrollLeft: false,
        canScrollRight: false,
      };

      if (direction === 'vertical' || direction === 'both') {
        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;
        const threshold = 1;
        
        // Check if content is actually scrollable
        const isScrollable = scrollHeight > clientHeight;
        const maxScroll = scrollHeight - clientHeight;
        const canScrollDownValue = isScrollable && scrollTop < maxScroll - threshold;
        const canScrollUpValue = isScrollable && scrollTop > threshold;
        
        console.log('[useScrollDetection] Vertical scroll check', {
          scrollTop,
          scrollHeight,
          clientHeight,
          maxScroll,
          isScrollable,
          threshold,
          canScrollUpValue,
          canScrollDownValue,
          calculation: `scrollTop (${scrollTop}) < maxScroll (${maxScroll}) - threshold (${threshold}) = ${scrollTop < maxScroll - threshold}`
        });
        
        newState.canScrollUp = canScrollUpValue;
        newState.canScrollDown = canScrollDownValue;
      }

      if (direction === 'horizontal' || direction === 'both') {
        const scrollLeft = container.scrollLeft;
        const scrollWidth = container.scrollWidth;
        const clientWidth = container.clientWidth;
        const threshold = 1;
        
        const isScrollable = scrollWidth > clientWidth;
        
        newState.canScrollLeft = isScrollable && scrollLeft > threshold;
        newState.canScrollRight = isScrollable && scrollLeft < scrollWidth - clientWidth - threshold;
      }

      console.log('[useScrollDetection] Setting new state', newState);
      setState((prevState) => {
        const changed = prevState.canScrollUp !== newState.canScrollUp || 
                       prevState.canScrollDown !== newState.canScrollDown ||
                       prevState.canScrollLeft !== newState.canScrollLeft ||
                       prevState.canScrollRight !== newState.canScrollRight;
        if (changed) {
          console.log('[useScrollDetection] State changed!', {
            prev: prevState,
            next: newState
          });
        }
        return newState;
      });
    };

    // Initial check with multiple RAF calls to catch layout changes
    console.log('[useScrollDetection] Setting up initial checks');
    const rafId1 = requestAnimationFrame(() => {
      console.log('[useScrollDetection] RAF 1 - First check');
      checkScroll();
      // Check again after a second frame to catch delayed layout
      requestAnimationFrame(() => {
        console.log('[useScrollDetection] RAF 2 - Second check');
        checkScroll();
        // One more check for images loading
        requestAnimationFrame(() => {
          console.log('[useScrollDetection] RAF 3 - Third check');
          checkScroll();
        });
      });
    });

    console.log('[useScrollDetection] Adding scroll event listener');
    container.addEventListener('scroll', () => {
      console.log('[useScrollDetection] Scroll event triggered');
      checkScroll();
    }, { passive: true });
    
    // Handle image loads that might change scroll height
    const handleImageLoad = () => {
      console.log('[useScrollDetection] Image load/error event - checking scroll');
      requestAnimationFrame(() => {
        requestAnimationFrame(checkScroll);
      });
    };
    
    // Find all images in the container and listen for load events
    const images = container.querySelectorAll('img');
    console.log('[useScrollDetection] Found images', { count: images.length });
    images.forEach((img, index) => {
      if (img.complete) {
        console.log(`[useScrollDetection] Image ${index} already loaded`);
        // Image already loaded, check immediately
        handleImageLoad();
      } else {
        console.log(`[useScrollDetection] Image ${index} not loaded yet, adding listeners`);
        img.addEventListener('load', () => {
          console.log(`[useScrollDetection] Image ${index} loaded`);
          handleImageLoad();
        }, { once: true });
        img.addEventListener('error', () => {
          console.log(`[useScrollDetection] Image ${index} error`);
          handleImageLoad();
        }, { once: true });
      }
    });
    
    const resizeObserver = new ResizeObserver(() => {
      console.log('[useScrollDetection] ResizeObserver triggered');
      requestAnimationFrame(() => {
        requestAnimationFrame(checkScroll);
      });
    });
    resizeObserver.observe(container);
    console.log('[useScrollDetection] ResizeObserver set up');

    // Observe mutations to catch content changes
    const mutationObserver = new MutationObserver((mutations) => {
      console.log('[useScrollDetection] MutationObserver triggered', { mutationCount: mutations.length });
      // Check if any images were added
      const hasNewImages = mutations.some(mutation => {
        return Array.from(mutation.addedNodes).some(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as Element;
            return el.tagName === 'IMG' || el.querySelector('img') !== null;
          }
          return false;
        });
      });
      
      console.log('[useScrollDetection] Mutation check', { hasNewImages });
      
      if (hasNewImages) {
        console.log('[useScrollDetection] New images detected, waiting for load');
        // Wait for images to potentially load
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const newImages = container.querySelectorAll('img');
            let loadedCount = 0;
            const totalImages = newImages.length;
            
            if (totalImages === 0) {
              checkScroll();
              return;
            }
            
            newImages.forEach(img => {
              if (img.complete) {
                loadedCount++;
              } else {
                img.addEventListener('load', () => {
                  loadedCount++;
                  if (loadedCount === totalImages) {
                    requestAnimationFrame(checkScroll);
                  }
                }, { once: true });
                img.addEventListener('error', () => {
                  loadedCount++;
                  if (loadedCount === totalImages) {
                    requestAnimationFrame(checkScroll);
                  }
                }, { once: true });
              }
            });
            
            if (loadedCount === totalImages) {
              requestAnimationFrame(checkScroll);
            }
          });
        });
      } else {
        requestAnimationFrame(checkScroll);
      }
    });
    mutationObserver.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    });

      return () => {
        console.log('[useScrollDetection] Cleaning up scroll detection');
        cancelAnimationFrame(rafId1);
        container.removeEventListener('scroll', checkScroll);
        resizeObserver.disconnect();
        mutationObserver.disconnect();
        images.forEach(img => {
          img.removeEventListener('load', handleImageLoad);
          img.removeEventListener('error', handleImageLoad);
        });
      };
    }
  }, [ref, direction]);

  return state;
}

/**
 * Hook to smoothly scroll a container
 */
export function useSmoothScroll(ref: RefObject<HTMLElement | null>) {
  const scrollBy = (amount: number, direction: 'horizontal' | 'vertical' = 'horizontal') => {
    const container = ref.current;
    if (!container) return;

    container.scrollBy({
      [direction === 'horizontal' ? 'left' : 'top']: amount,
      behavior: 'smooth',
    });
  };

  return { scrollBy };
}

