<?php
declare(strict_types=1);
namespace Kuiper\Core;
/**
 * Thrown by Controller::notFound() — Router turns it into the 404_override.
 * <!-- kuiper-core-ref: 1.1.3-draft -->
 */
final class NotFoundException extends \RuntimeException
{
}
