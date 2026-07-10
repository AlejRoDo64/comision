import { buildMessage, ValidateBy, ValidationOptions } from 'class-validator';

/**
 * GUID en formato canónico 8-4-4-4-12, sin restringir la versión RFC 4122.
 * Necesario porque SQL Server (NEWSEQUENTIALID/NEWID) genera GUIDs con
 * nibble de versión fuera de 1-5 (ej. ...-F111-...), que @IsUUID() rechaza.
 */
const GUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function IsGuid(validationOptions?: ValidationOptions): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isGuid',
      validator: {
        validate: (value): boolean =>
          typeof value === 'string' && GUID_REGEX.test(value),
        defaultMessage: buildMessage(
          (eachPrefix) => `${eachPrefix}$property debe ser un GUID válido`,
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
}
