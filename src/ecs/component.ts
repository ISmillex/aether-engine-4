/**
 * Base interface for all components in the ECS system.
 * Components are pure data containers with no logic.
 */
export interface Component {
  readonly type: string;
}

export type ComponentConstructor<T extends Component = Component> = new (...args: any[]) => T;