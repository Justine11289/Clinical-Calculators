import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { fhirDataService } from '../fhir-data-service';
import { LOINC_CODES } from '../fhir-codes';

// Create a mock function for the request
const mockRequest = jest.fn() as jest.Mock<(...args: any[]) => Promise<any>>;

// Mock FHIR Client
const mockClient = {
    patient: {
        id: 'test-patient-id',
        request: mockRequest
    }
};

describe('FHIRDataService', () => {
    beforeEach(() => {
        // Reset singleton state if possible or re-initialize
        document.body.innerHTML = '<div id="test-container"></div>';
        const container = document.getElementById('test-container');
        fhirDataService.initialize(mockClient, { id: 'test-patient-id' }, container as HTMLElement);
        mockRequest.mockClear();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('getObservation should fetch and return value', async () => {
        const mockObservation = {
            resourceType: 'Observation',
            code: {
                coding: [{ system: 'http://loinc.org', code: LOINC_CODES.WEIGHT }]
            },
            valueQuantity: {
                value: 70,
                unit: 'kg'
            },
            effectiveDateTime: '2023-01-01T00:00:00Z'
        };

        mockRequest.mockResolvedValueOnce({
            entry: [{ resource: mockObservation }]
        });

        const result = await fhirDataService.getObservation(LOINC_CODES.WEIGHT);

        expect(result.value).toBe(70);
        expect(result.unit).toBe('kg');
        expect(mockRequest).toHaveBeenCalledWith(
            expect.stringContaining(`code=${LOINC_CODES.WEIGHT}`)
        );
    });

    test('getObservation should handle no data found', async () => {
        mockRequest.mockResolvedValueOnce({
            entry: []
        });

        const result = await fhirDataService.getObservation('INVALID-CODE');

        expect(result.value).toBeNull();
    });

    test('getObservation should handle errors gracefully', async () => {
        mockRequest.mockRejectedValueOnce(new Error('Network error'));

        const result = await fhirDataService.getObservation(LOINC_CODES.HEIGHT);

        expect(result.value).toBeNull();
    });
});
