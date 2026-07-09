using System.Net;

namespace TalentHunt.Application.Utils;

public static class IpAddressNormalizer
{
    private const string Ipv4MappedPrefix = "::ffff:";

    public static string Normalize(IPAddress? address)
    {
        if (address is null)
            return "unknown";

        if (IPAddress.IsLoopback(address))
            return IPAddress.Loopback.ToString();

        if (address.IsIPv4MappedToIPv6)
            return address.MapToIPv4().ToString();

        return address.ToString();
    }

    public static string Normalize(string? ip)
    {
        if (string.IsNullOrWhiteSpace(ip))
            return "unknown";

        if (IPAddress.TryParse(ip, out var address))
            return Normalize(address);

        if (ip.StartsWith(Ipv4MappedPrefix, StringComparison.OrdinalIgnoreCase))
            return ip[Ipv4MappedPrefix.Length..];

        return ip;
    }
}
