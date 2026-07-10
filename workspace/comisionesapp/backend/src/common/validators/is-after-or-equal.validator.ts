import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

/**
 * Validador que asegura que una propiedad de tipo fecha sea posterior
 * o igual a otra propiedad del mismo DTO. Usado para fechaFin >= fechaInicio.
 */
export function IsAfterOrEqual(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isAfterOrEqual',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments): boolean {
          const [otherPropertyName] = args.constraints as string[];
          const otherValue = (args.object as Record<string, unknown>)[otherPropertyName];

          if (typeof value !== 'string' || typeof otherValue !== 'string') {
            return false;
          }

          const v = new Date(value).getTime();
          const o = new Date(otherValue).getTime();
          if (isNaN(v) || isNaN(o)) return false;

          return v >= o;
        },
        defaultMessage(args: ValidationArguments): string {
          const [otherPropertyName] = args.constraints as string[];
          return `${args.property} debe ser mayor o igual que ${otherPropertyName}`;
        },
      },
    });
  };
}