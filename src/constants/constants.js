export const PLANET_RADIUS = 80;
export const PLANET_COLLISION_RADIUS = 65; // effective collision radius for planet
export const ROCKET_RADIUS = 25;
export const BULLET_RADIUS = 5;
export const ASTEROID_RADIUS = 25;

export const BULLET_SPEED = 500; // pixels per second

export const ASTEROID_SPAWN_INTERVAL = 2000; // milliseconds
export const DESTROYED_ASTEROID_LIFETIME = 200; // milliseconds

export const EDGES = ['top', 'bottom', 'left', 'right'];

export const ASTEROID_SCREEN_PADDING = 50; // pixels outside the screen where asteroids can spawn

export const ASTEROID_TYPES_BACKGROUND = ['0%', '33.33%', '66.66%', '100%'];

export const ASTEROID_BACKGROUND_POSITION = 16.67; // percentage

export const ASTEROID_SPEED_RANGE = [75, 100, 125, 150, 175, 200]; // pixels per second

export const MAX_COLLISIONS_ALLOWED = 5; // after this many collisions with planet, game over

export const WIN_DESTROY_COUNT = 100;
