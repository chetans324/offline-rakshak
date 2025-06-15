
import React, { useEffect, useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Html5Qrcode } from 'html5-qrcode';
import { saveScannedQrCode } from '@/utils/offlineStorage';
import { Button } from '@/components/ui/button';
import { QrCode } from 'lucide-react';

const QrScanner: React.FC = () => {
  const [scanning, setScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const { toast } = useToast();
  const [html5QrCode, setHtml5QrCode] = useState<Html5Qrcode | null>(null);

  const qrScannerContainerId = "reader";

  useEffect(() => {
    // Initialize scanner instance
    const qrCodeInstance = new Html5Qrcode(qrScannerContainerId);
    setHtml5QrCode(qrCodeInstance);

    // Clean up scanner when component unmounts
    return () => {
      if (qrCodeInstance && qrCodeInstance.isScanning) {
        qrCodeInstance
          .stop()
          .catch((err) => console.error("Error stopping scanner:", err));
      }
    };
  }, []);

  const startScanning = () => {
    if (!html5QrCode) return;

    setScanning(true);
    setScanResult(null);

    const qrConfig = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    };

    html5QrCode
      .start(
        { facingMode: "environment" },
        qrConfig,
        handleScanSuccess,
        handleScanError
      )
      .catch((err) => {
        console.error("Error starting scanner:", err);
        toast({
          title: "Scanner Error",
          description: "Could not access camera. Please check permissions.",
          variant: "destructive",
        });
        setScanning(false);
      });
  };

  const stopScanning = () => {
    if (html5QrCode && html5QrCode.isScanning) {
      html5QrCode
        .stop()
        .then(() => {
          setScanning(false);
        })
        .catch((err) => {
          console.error("Error stopping scanner:", err);
        });
    }
  };

  const handleScanSuccess = (decodedText: string) => {
    setScanResult(decodedText);
    stopScanning();
    
    try {
      // Try to parse the QR data
      const qrData = JSON.parse(decodedText);
      
      // Save to offline storage
      saveScannedQrCode({
        content: qrData,
        timestamp: Date.now(),
      });
      
      toast({
        title: "QR Code Scanned",
        description: `Successfully scanned: ${qrData.title || 'Emergency QR Code'}`,
      });
    } catch (error) {
      // If not valid JSON, just save the text
      saveScannedQrCode({
        content: { text: decodedText },
        timestamp: Date.now(),
      });
      
      toast({
        title: "QR Code Scanned",
        description: "Scanned text may not be a valid emergency QR code",
      });
    }
  };

  const handleScanError = (err: unknown) => {
    // Don't show errors for normal scanning failures
    if (err === "QR code not found") {
      return;
    }
    console.error("QR Scan error:", err);
  };

  return (
    <div className="emergency-card">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <QrCode className="h-5 w-5 text-emergency" />
        QR Code Scanner
      </h2>

      <div className="mb-4 bg-muted rounded-lg overflow-hidden relative">
        <div
          id={qrScannerContainerId}
          className="w-full h-64 flex items-center justify-center border border-dashed border-gray-300 rounded-lg"
        >
          {!scanning && !scanResult && (
            <div className="text-center p-4">
              <QrCode className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p className="text-muted-foreground">
                Click "Start Scanning" to scan a QR code
              </p>
            </div>
          )}
          
          {/* Visual scanner indicator overlay */}
          {scanning && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-64 h-64 border-2 border-emergency animate-pulse rounded-lg"></div>
              <div className="absolute top-1/2 w-full h-0.5 bg-emergency opacity-70 animate-ping"></div>
              <div className="absolute left-1/2 h-full w-0.5 bg-emergency opacity-70"></div>
            </div>
          )}
        </div>
      </div>

      {scanResult && (
        <div className="mb-4 p-4 bg-accent rounded-lg">
          <h3 className="font-medium mb-1">Scan Result:</h3>
          <div className="text-sm overflow-auto max-h-32">
            {scanResult}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        {!scanning ? (
          <Button onClick={startScanning} className="emergency-primary w-full">
            Start Scanning
          </Button>
        ) : (
          <Button onClick={stopScanning} className="bg-gray-600 hover:bg-gray-700 text-white w-full">
            Stop Scanning
          </Button>
        )}
      </div>
    </div>
  );
};

export default QrScanner;
