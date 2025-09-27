import React, { useEffect, useRef } from 'react';
import styles from '../styles/maincomponent.module.css';
import { ASTEROID_BACKGROUND_POSITION, ASTEROID_RADIUS, ASTEROID_SCREEN_PADDING, ASTEROID_SPAWN_INTERVAL, ASTEROID_SPEED_RANGE, ASTEROID_TYPES_BACKGROUND, BULLET_RADIUS, BULLET_SPEED, DESTROYED_ASTEROID_LIFETIME, EDGES, GAME_OUTCOMES, MAX_COLLISIONS_ALLOWED, PLANET_COLLISION_RADIUS, PLANET_RADIUS, ROCKET_RADIUS, WIN_DESTROY_COUNT } from '../constants/constants';
import { getAngle, getCorrectedCoordinates } from '../utils/utils';

export default function MainComponent({ handleGameOver, difficulty }) {
    const midPoint = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    const cursorPositionRef = useRef({ x: 0, y: 0 });
    const bulletsRef = useRef([]);
    const asteroidsRef = useRef([]);
    const destroyedAsteroidsRef = useRef([]);
    const rocketRef = useRef(null);
    const rocketPositionRef = useRef({ x: midPoint.current.x + PLANET_RADIUS, y: midPoint.current.y });
    const containerRef = useRef(null);
    const animationFrameIdRef = useRef(null);
    const lastAnimationTimeRef = useRef(null);
    const lastAsteroidSpawnTimeRef = useRef(null);
    const destroyedAsteroidLastRenderTimeRef = useRef(null);
    const healthElementRef = useRef(null);
    const scoreElementRef = useRef(null);
    const collisionCountRef = useRef(0);
    const destroyedAsteroidCountRef = useRef(0);

    const moveRocketPosition = () => {
        const position = cursorPositionRef.current;
        const angle = getAngle(position, midPoint.current);
        const newRocketPosition = {
            x: PLANET_RADIUS * Math.cos(angle) + midPoint.current.x,
            y: PLANET_RADIUS * Math.sin(angle) + midPoint.current.y
        }
        rocketPositionRef.current = newRocketPosition;
        if (rocketRef.current) {
            rocketRef.current.style.left = `${newRocketPosition.x}px`;
            rocketRef.current.style.top = `${window.innerHeight - newRocketPosition.y}px`;
            rocketRef.current.style.transform = `translate(-50%, -50%) rotate(${-1 * angle}rad)`;
        }

    }

    const addBulletToDoc = (position) => {
        const newBullet = document.createElement('div');
        newBullet.className = styles.bullet;
        newBullet.style.left = `${position.x}px`;
        newBullet.style.top = `${window.innerHeight - position.y}px`;
        containerRef.current.appendChild(newBullet);
        return newBullet;
    }

    const addNewAsteroidToDoc = (position) => {
        const asteroidType = Math.floor(Math.random() * ASTEROID_TYPES_BACKGROUND.length);
        const asteroid = document.createElement('div');
        asteroid.className = styles.asteroid;
        asteroid.style.left = `${position.x}px`;
        asteroid.style.top = `${window.innerHeight - position.y}px`;
        asteroid.style.backgroundPositionY = ASTEROID_TYPES_BACKGROUND[asteroidType];
        containerRef.current.appendChild(asteroid);
        return asteroid;
    }

    const onBulletFire = (event) => {
        const initialPosition = rocketPositionRef.current;
        const coordinates = getCorrectedCoordinates(event);
        const angle = getAngle(coordinates, midPoint.current);
        const bullet = addBulletToDoc(initialPosition);
        const bulletData = {
            position: initialPosition,
            angle,
            el: bullet,
            speed: BULLET_SPEED,
        }
        bulletsRef.current = [
            ...(bulletsRef.current || []), bulletData
        ];
    };


    const renderObjects = (objects, deltaTime) => {
        if (!objects) return;

        objects?.forEach((object, index) => {
            const pixelsMoved = deltaTime * object.speed;
            const angle = object.angle;
            const dx = pixelsMoved * Math.cos(angle);
            const dy = pixelsMoved * Math.sin(angle);
            const newX = object.position.x + dx;
            const newY = object.position.y + dy;
            object.position = { x: newX, y: newY };
            object.el.style.left = `${newX}px`;
            object.el.style.top = `${window.innerHeight - newY}px`;

            // Remove bullets off-screen
            if (
                newX < -ASTEROID_SCREEN_PADDING || newX > window.innerWidth + ASTEROID_SCREEN_PADDING ||
                newY < -ASTEROID_SCREEN_PADDING || newY > window.innerHeight + ASTEROID_SCREEN_PADDING
            ) {
                object.el.remove();
                objects.splice(index, 1);
            }
        });
    }

    const spawnAsteroids = (time) => {
        if (!lastAsteroidSpawnTimeRef.current || (time - lastAsteroidSpawnTimeRef.current) > ASTEROID_SPAWN_INTERVAL[difficulty]) {
            lastAsteroidSpawnTimeRef.current = time;
            let position = {
                x: 0,
                y: 0
            }
            const edge = EDGES[Math.floor(Math.random() * EDGES.length)];
            switch (edge) {
                case 'top':
                    position.x = Math.random() * window.innerWidth;
                    position.y = window.innerHeight + ASTEROID_SCREEN_PADDING;
                    break;
                case 'bottom':
                    position.x = Math.random() * window.innerWidth;
                    position.y = -ASTEROID_SCREEN_PADDING;
                    break;
                case 'left':
                    position.x = -ASTEROID_SCREEN_PADDING;
                    position.y = Math.random() * window.innerHeight;
                    break;
                case 'right':
                    position.x = window.innerWidth + ASTEROID_SCREEN_PADDING;
                    position.y = Math.random() * window.innerHeight;
                    break;
            }
            const angle = getAngle(midPoint.current, position);
            const speed = ASTEROID_SPEED_RANGE[Math.floor(Math.random() * ASTEROID_SPEED_RANGE.length)];
            const asteroid = addNewAsteroidToDoc(position);
            const asteroidData = {
                position,
                angle,
                el: asteroid,
                speed,
            }
            if (asteroidsRef.current) {
                asteroidsRef.current.push(asteroidData);
            } else {
                asteroidsRef.current = [asteroidData];
            }
        }
    }

    const isBulletHit = (bullet, asteroid) => {
        const x1 = bullet.position.x;
        const y1 = bullet.position.y;
        const x2 = asteroid.position.x;
        const y2 = asteroid.position.y;
        const distanceSquared = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
        return distanceSquared < (BULLET_RADIUS + ASTEROID_RADIUS);
    }

    const isCollidingPlanetOrRocket = (asteroid) => {
        const x1 = asteroid.position.x;
        const y1 = asteroid.position.y;
        const x2 = midPoint.current.x;
        const y2 = midPoint.current.y;
        const distanceSquared = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
        if (distanceSquared < (PLANET_COLLISION_RADIUS + ASTEROID_RADIUS)) return true;
        const rocketPos = rocketPositionRef.current;
        const x3 = rocketPos.x;
        const y3 = rocketPos.y;
        const distanceRocket = Math.sqrt((x1 - x3) * (x1 - x3) + (y1 - y3) * (y1 - y3));
        return distanceRocket < (ASTEROID_RADIUS + ROCKET_RADIUS);
    }

    const onAsteroidHit = (asteroid) => {
        asteroid.el.style.backgroundPositionX = `${ASTEROID_BACKGROUND_POSITION}%`;
        asteroid.backgroundPosition = ASTEROID_BACKGROUND_POSITION;
        destroyedAsteroidsRef.current = [
            ...(destroyedAsteroidsRef.current || []),
            asteroid
        ];
    }

    const checkCollision = () => {
        if (!asteroidsRef.current) return;
        // Check for collisions between bullets and asteroids
        if (bulletsRef.current) {
            bulletsRef.current = bulletsRef.current.filter((bullet) => {
                let bulletDestroyed = false;
                asteroidsRef.current = asteroidsRef.current.filter((asteroid, asteroidIndex) => {
                    if (isBulletHit(bullet, asteroid)) {
                        destroyedAsteroidCountRef.current += 1;
                        if (scoreElementRef.current) {
                            scoreElementRef.current.style.width = `${Math.min(100, (destroyedAsteroidCountRef.current / WIN_DESTROY_COUNT) * 100)}%`;
                        }
                        bulletDestroyed = true;
                        bullet.el.remove();
                        onAsteroidHit(asteroid);
                        return false;
                    }
                    return true;
                });
                return !bulletDestroyed;
            });
        }

        // check for collisions between asteroids and planet or rocket
        asteroidsRef.current = asteroidsRef.current.filter((asteroid) => {
            if (isCollidingPlanetOrRocket(asteroid)) {
                onAsteroidHit(asteroid);
                collisionCountRef.current += 1;
                if (healthElementRef.current) {
                    healthElementRef.current.style.width = `${Math.max(0, ((MAX_COLLISIONS_ALLOWED - collisionCountRef.current) / MAX_COLLISIONS_ALLOWED) * 100)}%`;
                }
                return false;
            }
            return true;
        });
    }

    const renderDestroyedAsteroids = (now) => {
        if (!destroyedAsteroidsRef.current) return;
        if (!destroyedAsteroidLastRenderTimeRef.current || (now - destroyedAsteroidLastRenderTimeRef.current) > DESTROYED_ASTEROID_LIFETIME) {
            destroyedAsteroidLastRenderTimeRef.current = now;
            destroyedAsteroidsRef.current.forEach((asteroid, index) => {
                let currentBackgroudPosition = asteroid.backgroundPosition || ASTEROID_BACKGROUND_POSITION;
                currentBackgroudPosition += ASTEROID_BACKGROUND_POSITION;
                if (currentBackgroudPosition > 102) {
                    asteroid.el.remove();
                    destroyedAsteroidsRef.current.splice(index, 1);
                    return;
                }
                asteroid.el.style.backgroundPositionX = `${currentBackgroudPosition}%`;
                asteroid.backgroundPosition = currentBackgroudPosition;
            })
        }
    }

    const animate = () => {
        const now = Date.now();
        const deltaTime = lastAnimationTimeRef.current ? (now - lastAnimationTimeRef.current) / 1000 : 0;
        lastAnimationTimeRef.current = now;
        renderObjects(bulletsRef.current, deltaTime);
        renderObjects(asteroidsRef.current, deltaTime);
        renderDestroyedAsteroids(now);
        spawnAsteroids(now);
        checkCollision();
        if (destroyedAsteroidCountRef.current >= WIN_DESTROY_COUNT) {
            handleGameOver({
                outcome: GAME_OUTCOMES.VICTORY,
            })
            return;
        }
        if (collisionCountRef.current >= MAX_COLLISIONS_ALLOWED) {
            handleGameOver({
                outcome: GAME_OUTCOMES.LOST,
                score: destroyedAsteroidCountRef.current
            })
            return;
        }
        animationFrameIdRef.current = requestAnimationFrame(animate);
    };


    useEffect(() => {
        window.addEventListener('click', onBulletFire);
        moveRocketPosition();
        animate();
        return () => {
            cancelAnimationFrame(animationFrameIdRef.current);
            window.removeEventListener('click', onBulletFire);
        };
    }, []);


    const handleMouseMove = (event) => {
        cursorPositionRef.current = getCorrectedCoordinates(event);
        moveRocketPosition();
    };


    return (
        <div ref={containerRef} className={styles.container} onMouseMove={handleMouseMove}>
            <img className={styles.planet} src={`${process.env.PUBLIC_URL}/images/planet.webp`} alt="planet" />
            <img className={styles.rocket} ref={rocketRef} src="/images/rocket.png" alt="rocket" />
            <div className={styles.gameState}>
                <div className={styles.lifeLineContainer}>
                    <div ref={healthElementRef} className={styles.lifeLine}></div>
                </div>
                <div className={styles.lifeLineContainer}>
                    <div ref={scoreElementRef} className={styles.score}></div>
                </div>
            </div>
        </div>
    );
}